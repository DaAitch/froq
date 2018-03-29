import os from 'os';
import http from 'http';
import {Readable} from 'stream';
import {EventEmitter} from 'events';

import JSONStream from 'JSONStream';

import debug from './debug';
import Image from './Image';
import Container from './Container';
import Inspection from './Inspection';

const json = arg => {
    try {
        return JSON.parse(arg);
    } catch (e) {
        return null;
    }
};

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

const promisifyResponseStream = async (res, onProgress = undefined) => {
    if (onProgress) {
        res.on('progress', onProgress);
    }

    return await new Promise((resolve, reject) => {
        res.on('error', reject);
        res.on('end', resolve);
    });
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
    }

    async _request ({
        path,
        method,
        query = undefined,
        bodyStream = undefined,
        bodyContentLength = undefined,
        bodyContentType = undefined,
        responseStream = false
    }) {
        
        const headers = {};

        if (bodyContentLength !== undefined) {
            headers['Content-Length'] = bodyContentLength;
        }

        if (bodyContentType) {
            headers['Content-Type'] = bodyContentType;
        }

        let queryString = '';
        if (query) {
            queryString = Object.keys(query)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
                .join('&')
            ;
        }

        const pathAndQuery = `${path}?${queryString}`;

        const opts = {
            socketPath: this._socketPath,
            path: pathAndQuery,
            method,
            headers,
        };

        const req = http.request(opts, () => {});

        return await new Promise((resolve, reject) => {
            req.on('error', reject);
            req.on('response', res => {

                if (res.statusCode >= 400 && res.statusCode <= 599) {
                    reject(new Error(`${res.statusCode} ${res.statusMessage}: ${pathAndQuery}`));
                    return;
                }
                
                if (responseStream) {

                    const ee = new EventEmitter();
                    
                    const parser = JSONStream.parse();
                    let onData, onError, onEnd;

                    const removeListener = () => {
                        parser.removeListener('data', onData);
                        parser.removeListener('error', onError);
                        parser.removeListener('end', onEnd);
                    };

                    onData = event => {
                        ee.emit('progress', event);
                    };

                    onError = e => {
                        removeListener();
                        ee.emit('error', e);
                    };

                    onEnd = () => {
                        removeListener();
                        ee.emit('end');
                    };

                    parser.on('data', onData);
                    parser.on('error', onError);
                    parser.on('end', onEnd);

                    res.pipe(parser);

                    return resolve(ee);
                }

                const chunks = [];

                res.on('data', chunk => {
                    chunks.push(chunk);
                });
            
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    const result = json(buffer);

                    resolve(result);
                });
            });
    
            if (bodyStream) {

                // auto end
                bodyStream.pipe(req);
            } else {

                req.end();
            }
        });
    }

    async listContainers () {
        debug('list containers');
        return await this._request({method: 'GET', path: '/containers/json'});
    }

    async listImages () {
        debug('list images');
        return await this._request({method: 'GET', path: '/images/json'});
    }

    /**
     * @return {Promise<Image>}
     */
    async pull ({fromImage, tag = undefined}, onProgress = undefined) {

        debug('pull image: %o', {fromImage, tag});

        const query = {
            fromImage
        };

        if (tag) {
            query.tag = tag;
        }

        const res = await this._request({
            method: 'POST',
            path: '/images/create',
            query,
            responseStream: true
        });

        await promisifyResponseStream(res, event => {
            debug('pull event: %o', event);

            if (onProgress) {
                onProgress(event);
            }
        });

        let repoTag = fromImage;
        if (tag) {
            repoTag += `:${tag}`;
        }

        return new Image(this, repoTag);
    }

    async createContainer ({data, name = undefined}) {

        debug('create container %O', {data, name});

        const dataString = JSON.stringify(data);

        const body = await this._request({
            method: 'POST',
            path: '/containers/create',
            query: pick({name}),
            bodyStream: stringstream(dataString),
            bodyContentLength: Buffer.byteLength(dataString),
            bodyContentType: 'application/json'
        });

        const containerId = body && body.Id;
        return new Container(this, containerId);
    }

    async startContainer ({id, detachKeys = undefined}) {
        debug('start container: %o', {id, detachKeys});

        return await this._request({
            method: 'POST',
            path: `/containers/${encodeURIComponent(id)}/start`,
            query: pick({detachKeys})
        });
    }

    async stopContainer ({id, t = undefined}) {
        debug('stop container: %o', {id, t});

        return await this._request({
            method: 'POST',
            path: `/containers/${encodeURIComponent(id)}/stop`,
            query: pick({t})
        });
    }

    async removeContainer ({id, v = undefined, force = undefined, link = undefined}) {
        debug('remove container: %o', {id, v, force, link});

        return await this._request({
            method: 'DELETE',
            path: `/containers/${encodeURIComponent(id)}`,
            query: pick({v, force, link})
        });
    }

    async inspectContainer ({id, size = undefined}) {
        debug('inspect container: %o', {id, size});

        const data = await this._request({
            method: 'GET',
            path: `/containers/${encodeURIComponent(id)}/json`,
            query: pick({size})
        });

        return new Inspection(this, data);
    }

    async waitForContainer ({id, condition = undefined}) {
        debug('wait for container: %o', {id, condition});
        
        return await this._request({
            method: 'POST',
            path: `/containers/${encodeURIComponent(id)}/wait`,
            query: pick({condition})
        });
    }

    async build ({dockerfile = undefined, t, bodyStream, bodyContentType, bodyContentLength}, onProgress = undefined) {
        debug('build image: %o', {dockerfile, t, bodyContentLength, bodyContentType});

        const res = await this._request({
            method: 'POST',
            path: '/build',
            query: pick({
                dockerfile,
                t
            }),
            bodyStream,
            bodyContentLength,
            bodyContentType,
            responseStream: true
        });

        await promisifyResponseStream(res, event => {
            debug('build event: %o', event);

            if (onProgress) {
                onProgress(event);
            }
        });

        return new Image(this, t);
    }

    async removeImage ({name, force = undefined, noprune = undefined}) {
        debug('remove image: %o', {name, force, noprune});
        
        await this._request({
            method: 'DELETE',
            path: `/images/${encodeURIComponent(name)}`,
            query: pick({force, noprune})
        });
    }
}
