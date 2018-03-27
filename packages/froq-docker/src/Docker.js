import os from 'os';
import http from 'http';
import {EventEmitter} from 'events';

import {log} from 'froq-util';
import JSONStream from 'JSONStream';
import {normalizeRepoTag} from './util';
import Container from './Container';
import Image from './Image';

const json = arg => {
    try {
        return JSON.parse(arg);
    } catch (e) {
        return null;
    }
};

export default class Docker {

    static fromSocket (socketPath = undefined, https = false) {

        if (socketPath === undefined) {
            socketPath = (os.type() === 'Windows_NT') ? '//./pipe/docker_engine' : '/var/run/docker.sock';
        }
        
        log.info(`create docker from sock file: ${socketPath}`);
        return new Docker(socketPath, https);
    }

    constructor (socketPath, https) {
        this._socketPath = socketPath;
        this._https = https;
    }

    async _request ({
        path,
        method = 'GET',
        body = undefined,
        query = undefined,
        stream = false
    }) {
        
        let bodyBufferOrString;
        const headers = {};
        
        if (body !== undefined) {
            bodyBufferOrString = JSON.stringify(body);
            headers['Content-Length'] = Buffer.byteLength(bodyBufferOrString);
            headers['Content-Type'] = 'application/json';
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
                
                if (stream) {

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
    
            if (bodyBufferOrString) {
                req.write(bodyBufferOrString);
            }

            req.end();
        });
    }

    async getContainers () {
        return await this._request({
            path: '/containers/json'
        });
    }

    /**
     * @return {Promise<Image>}
     */
    async pull ({fromImage, tag = undefined}, onProgress = undefined) {

        const query = {
            fromImage
        };

        if (tag) {
            query.tag = tag;
        }

        const res = await this._request({
            path: '/images/create',
            method: 'POST',
            query,
            stream: true
        });

        if (onProgress) {
            res.on('progress', onProgress);
        }
        
        return await new Promise((resolve, reject) => {
            res.on('error', reject);
            res.on('end', () => {
                let repoTag = fromImage;
                if (tag) {
                    repoTag += `:${tag}`;
                }

                resolve(new Image(this, repoTag));
            });
        });
    }

    createContainer (repoTag) {
        const opts = {
            Image: normalizeRepoTag(repoTag)
        };

        const builder = {
            bind: (port, hostPort = '', hostIp = undefined) => {
                opts.PortBindings = opts.PortBindings || {};
                opts.PortBindings[port] = opts.PortBindings[port] || [];

                const binding = {
                    HostPort: hostPort
                };
                if (hostIp !== undefined) {
                    binding.HostIp = hostIp;
                }
                opts.PortBindings[port].push(binding);

                return builder;
            },
            env: (envVar, value) => {
                opts.Env = opts.Env || [];
                opts.Env.push(`${envVar}=${value}`);
                return builder;
            },

            build: async () => {
                log.info(`build container ${repoTag}`);
                const body = await this._request({
                    path: '/containers/create',
                    method: 'POST',
                    body: opts,
                });

                return new Container(this, body.Id);
            }
        };

        return builder;
    }

    async startContainer (containerId) {
        return await this._request({
            path: `/containers/${encodeURIComponent(containerId)}/start`,
            method: 'POST'
        });
    }
}
