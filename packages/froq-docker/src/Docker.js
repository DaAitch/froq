import os from 'os';
import {Readable} from 'stream';

import debug from './debug';
import Image from './Image';
import Container from './Container';
import Inspection from './Inspection';
import Connection from './Connection';
import {toJson, jsonStream, progressStream, checkStatusCode} from './stream-util';
import DockerRawStream from './DockerRawStream';
import DockerDuplexStream from './DockerDuplexStream';

const stringstream = stringOrBuffer => {
    const stream = new Readable();
    stream.push(stringOrBuffer);
    stream.push(null);

    return stream;
};

const pick = obj => {
    const result = {};

    for (const k in obj) {
        const value = obj[k];
        if (value !== undefined) {
            result[k] = value;
        }
    }

    return result;
};

export default class Docker {

    static fromSocket (socketPath = undefined, https = false) {

        if (socketPath === undefined) {
            socketPath = (os.type() === 'Windows_NT') ? '//./pipe/docker_engine' : '/var/run/docker.sock';
        }
        
        debug('create docker from sock file: %s', socketPath);
        return new Docker(socketPath, https);
    }

    constructor (socketPath, https) {
        this._socketPath = socketPath;
        this._https = https;

        this._connection = new Connection(socketPath);
    }

    async listContainers () {
        debug('list containers');
        return await this._connection
            .request({method: 'GET', path: '/containers/json'})
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    async listImages () {
        debug('list images');
        return await this._connection
            .request({method: 'GET', path: '/images/json'})
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    /**
     * @return {Promise<Image>}
     */
    async pull ({fromImage, tag = undefined}, onProgress = undefined) {

        debug('pull image: %o', {fromImage, tag});

        const query = {
            fromImage
        };

        let repoTag = fromImage;
        if (tag) {
            query.tag = tag;
            repoTag += `:${tag}`;
        }

        await this._connection
            .request({
                method: 'POST',
                path: '/images/create',
                query
            })
            .then(checkStatusCode)
            .then(jsonStream)
            .then(progressStream(data => {
                debug('pull event: %o', data);

                if (onProgress) {
                    onProgress(data);
                }
            }))
        ;

        return new Image(this, repoTag);
    }

    async createContainer ({data, name = undefined}) {
        debug('create container %O', {data, name});

        const body = await this._connection
            .request({
                method: 'POST',
                path: '/containers/create',
                query: pick({name}),
                writeStream: stringstream(JSON.stringify(data)),
                headers: {
                    'content-type': 'application/json'
                }
            })
            .then(checkStatusCode)
            .then(toJson)
        ;

        const containerId = body && body.Id;
        return new Container(this, containerId);
    }

    async startContainer ({id, detachKeys = undefined}) {
        debug('start container: %o', {id, detachKeys});

        return await this._connection
            .request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/start`,
                query: pick({detachKeys})
            })
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    async stopContainer ({id, t = undefined}) {
        debug('stop container: %o', {id, t});

        return await this._connection
            .request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/stop`,
                query: pick({t})
            })
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    async removeContainer ({id, v = undefined, force = undefined, link = undefined}) {
        debug('remove container: %o', {id, v, force, link});

        return await this._connection
            .request({
                method: 'DELETE',
                path: `/containers/${encodeURIComponent(id)}`,
                query: pick({v, force, link})
            })
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    async inspectContainer ({id, size = undefined}) {
        debug('inspect container: %o', {id, size});

        const data = await this._connection
            .request({
                method: 'GET',
                path: `/containers/${encodeURIComponent(id)}/json`,
                query: pick({size})
            })
            .then(checkStatusCode)
            .then(toJson)
        ;

        return new Inspection(this, data);
    }

    async waitForContainer ({id, condition = undefined}) {
        debug('wait for container: %o', {id, condition});
        
        return await this._connection
            .request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/wait`,
                query: pick({condition})
            })
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    async attachContainer ({id}, streamCb) {
        debug('attach container %s', id);
        
        return await new Promise((resolve, reject) => {
            this._connection
                .request({
                    method: 'POST',
                    path: `/containers/${encodeURIComponent(id)}/attach`,
                    query: {
                        stream: '1',
                        stdout: '1',
                        stderr: '1'
                    },
                    headers: {
                        'content-type': 'application/vnd.docker.raw-stream',
                        upgrade: 'tcp',
                        connection: 'Upgrade'
                    },
                    upgrade: (res_, socket) => {
                        socket.on('error', err => {
                            debug('socket error container %s: %o', id, err);
                            reject(err);
                        });

                        // `socket.end` does not emit 'end' event, so with
                        // rawStream.end() also socket is ended and this is resolved

                        streamCb(new DockerRawStream(socket, () => {
                            debug('socket ended container %s', id);
                            resolve();
                        }));
                    }
                })
            ;
        });
    }

    async createContainerExec ({id, data}) {
        debug('create container exec for %s: %o', id, data);

        return await this._connection
            .request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/exec`,
                writeStream: stringstream(JSON.stringify(data)),
                headers: {
                    'content-type': 'application/json'
                }
            })
            .then(checkStatusCode)
            .then(toJson)
        ;
    }

    async startContainerExec ({id, data}, streamCb) {
        debug('start container exec %s: %o', id, data);

        return await new Promise((resolve, reject) => {
            this._connection
                .request({
                    method: 'POST',
                    path: `/exec/${encodeURIComponent(id)}/start`,
                    writeStream: stringstream(JSON.stringify(data)),
                    headers: {
                        'content-type': 'application/json',
                        upgrade: 'tcp',
                        connection: 'Upgrade'
                    },
                    upgrade: (res_, socket) => {
                        socket.on('error', err => {
                            debug('socket error container %s: %o', id, err);
                            reject(err);
                        });

                        // `socket.end` does not emit 'end' event, so with
                        // rawStream.end() also socket is ended and this is resolved
                        
                        streamCb(new DockerDuplexStream(socket, () => {
                            debug('socket ended container %s', id);
                            resolve();
                        }));
                    }
                })
            ;
        });
    }

    async build ({dockerfile = undefined, t, writeStream, contentType}, onProgress = undefined) {
        debug('build image: %o', {dockerfile, t, contentType});

        await this._connection
            .request({
                method: 'POST',
                path: '/build',
                query: pick({
                    dockerfile,
                    t
                }),
                writeStream,
                headers: {
                    'content-type': contentType
                }
            })
            .then(checkStatusCode)
            .then(jsonStream)
            .then(progressStream(data => {
                debug('build event: %o', data);

                if (onProgress) {
                    onProgress(data);
                }
            }))
        ;

        return new Image(this, t);
    }

    async removeImage ({name, force = undefined, noprune = undefined}) {
        debug('remove image: %o', {name, force, noprune});
        
        await this._connection
            .request({
                method: 'DELETE',
                path: `/images/${encodeURIComponent(name)}`,
                query: pick({force, noprune})
            })
            .then(checkStatusCode)
            .then(toJson)
        ;
    }
}
