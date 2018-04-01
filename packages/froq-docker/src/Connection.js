import http from 'http';

import debug from './debug';

export default class Connection {

    constructor (socketPath) {
        this._socketPath = socketPath;
    }

    _qs (query) {
        if (!query) {
            return '';
        }

        return Object.keys(query)
            .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`)
            .join('&')
        ;
    }

    async request ({
        path,
        method,
        query = undefined,
        writeStream = undefined,
        headers = {},
        upgrade = undefined
    }) {
        const pathAndQuery = `${path}?${this._qs(query)}`;

        const opts = {
            socketPath: this._socketPath,
            path: pathAndQuery,
            method,
            headers,
        };

        debug('%s %s: %o', method, pathAndQuery, {headers});
        const req = http.request(opts, () => {});

        if (upgrade) {
            req.on('upgrade', (res, socket, upgradeHeader) => {
                debug('getting response upgrade %d "%s": %o', res.statusCode, res.statusMessage, {headers: res.headers});
                upgrade(res, socket, upgradeHeader);
            });
        }

        return await new Promise((resolve, reject) => {
            req.on('error', reject);
            req.on('response', res => {
                debug('getting response %d "%s": %o', res.statusCode, res.statusMessage, {headers: res.headers});
                resolve(res);
            });
    
            if (writeStream) {
                const pipeOpts = {end: !upgrade};
                debug('writing stream to request: %o', pipeOpts);
                writeStream.pipe(req, pipeOpts);
            }
            
            if (upgrade && !req.headersSent) {
                debug('flush headers');
                req.flushHeaders();
            }

            if (!writeStream && !upgrade) {
                debug('request end');
                req.end();
            }
        });
    }
}
