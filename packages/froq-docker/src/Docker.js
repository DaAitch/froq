import os from 'os';
import util from 'util';
import http from 'http';

import request from 'request';
import {log} from 'froq-util';
import JSONStream from 'JSONStream';
import {normalizeRepoTag} from './util';
// import Container from './Container';
import PullEvent from './PullEvent';

const requestAsync = util.promisify(request);

const json = string => {
    try {
        return JSON.parse(string);
    } catch (e) {
        return null;
    }
};

export default class Docker {

    static fromSocket (socketPath = undefined, https = false) {
        
        if (socketPath === undefined) {
            if (os.type() !== 'Windows_NT') {
                socketPath = 'unix:/var/run/docker.sock';
            } else {
                // something with: '//./pipe/docker_engine' ?
                throw new Error('not implemented yet');
            }
        }

        const protocol = https ? 'https' : 'http';
        
        log.info(`create docker from sock file: ${socketPath}`);
        return new Docker(`${protocol}://${socketPath}:`);
    }

    constructor (baseUrl) {
        this._baseUrl = baseUrl;
    }

    async _request (path, options = {}) {
        const opts = {
            ...options,
            host: 'localhost',
            headers: {
                ...((options && options.headers) || {}),
                host: 'localhost'
            }
        };

        const requestUrl = this._baseUrl + path;
        console.log(requestUrl, opts);

        // return await requestAsync(requestUrl, opts);
        http.request({
            socketPath: 
        })
    }

    async getContainers () {
        const res = await this._request('/containers/json');
        return json(res.body);
    }

    /**
     * @param {string} repoTag
     * @param {(event: PullEvent) => void} onProgress
     */
    async pull (repoTag, onProgress) {
        const normalizedRepoTag = normalizeRepoTag(repoTag);


        const res = await this._request('/images/create', {
            method: 'POST',
            json: true,
            body: {
                fromImage: normalizedRepoTag
            }
        });

        console.log(res.headers, res.statusCode, res.body);




        // log.info(`pull ${repoTag} (${normalizedRepoTag})`);
        // return new Promise((resolve, reject) => {
        //     this._dockerode.pull(normalizedRepoTag, undefined, (err, outStream) => {
        //         if (err) {
        //             return reject(err);
        //         }

        //         const parser = JSONStream.parse();

        //         let onData, onError, onEnd;

        //         const removeListener = () => {
        //             parser.removeListener('data', onData);
        //             parser.removeListener('error', onError);
        //             parser.removeListener('end', onEnd);
        //         };

        //         onData = event => {
        //             if (event.error) {
        //                 return onError(event.error);
        //             }

        //             if (onProgress) {
        //                 onProgress(new PullEvent(event));
        //             }
        //         };

        //         onError = e => {
        //             removeListener();
        //             reject(e);
        //         };

        //         onEnd = () => {
        //             removeListener();
        //             log.info(`pull finish ${repoTag}`);
        //             resolve();
        //         };

        //         parser.on('data', onData);
        //         parser.on('error', onError);
        //         parser.on('end', onEnd);

        //         outStream.pipe(parser);
        //     });
        // });
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
                const res = await this._request('/containers/create', {
                    method: 'POST',
                    json: true,
                    body: opts
                });

                return res.body;
            }
        };

        return builder;
    }
}
