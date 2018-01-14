import Dockerode from 'dockerode';
import { log } from 'froq-util';
import JSONStream from 'JSONStream';
import os from 'os';

import { normalizeRepoTag } from './util';
import Container from './Container';
import PullEvent from './PullEvent';

export default class Docker {

    static fromSocket(socketPath = undefined) {
        
        if (socketPath === undefined) {
            socketPath = (os.type() === 'Windows_NT') ? '//./pipe/docker_engine' : '/var/run/docker.sock';
        }
        
        log.info(`create docker from sock file: ${socketPath}`);
        return new Docker(new Dockerode({socketPath}));
    }

    /**
     * 
     * @param {Dockerode} dockerode 
     */
    constructor(dockerode) {
        this._dockerode = dockerode;
    }

    /**
     * 
     * @param {string} repoTag 
     * @param {(event: PullEvent) => void} onProgress 
     */
    async pull(repoTag, onProgress) {
        const normalizedRepoTag = normalizeRepoTag(repoTag);

        log.info(`pull ${repoTag} (${normalizedRepoTag})`);
        return new Promise((resolve, reject) => {
            this._dockerode.pull(normalizedRepoTag, undefined, (err, outStream) => {
                if (err) {
                    return reject(err);
                }

                const parser = JSONStream.parse();

                let onData, onError, onEnd;

                const removeListener = () => {
                    parser.removeListener('data', onData);
                    parser.removeListener('error', onError);
                    parser.removeListener('end', onEnd);
                };

                onData = event => {
                    if (event.error) {
                        return onError(event.error);
                    }

                    if (onProgress) {
                        onProgress(new PullEvent(event));
                    }
                };

                onError = err => {
                    removeListener();
                    reject(err);
                };

                onEnd = event => {
                    removeListener();
                    log.info(`pull finish ${repoTag}`);
                    resolve();
                };

                parser.on('data', onData);
                parser.on('error', onError);
                parser.on('end', onEnd);

                outStream.pipe(parser);
            });
        });
    }

    createContainer(repoTag) {
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
                return new Container(await this._dockerode.createContainer(opts));
            }
        };

        return builder;
    }
}