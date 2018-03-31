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

        const req = http.request(opts, () => {});

        if (upgrade) {
            req.on('upgrade', upgrade);
        }

        return await new Promise((resolve, reject) => {
            req.on('error', reject);
            req.on('response', resolve);
    
            if (writeStream) {
                debug('writing stream to request');
                writeStream.pipe(req);
            } else if (upgrade) {
                debug('flush headers');
                req.flushHeaders();
            } else {
                debug('request end');
                req.end();
            }
        });
    }
}
