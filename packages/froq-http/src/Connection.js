import http from 'http';

import debug from './debug';

export default class Server {

    /**
     * @param {string} name
     */
    constructor (name = 'server') {
        this._name = name;
        this._sockets = [];
    }

    /**
     * @returns {string}
     */
    get name () {
        return this._name;
    }

    /**
     * @param {number?} port
     * @param {string?} address
     */
    start (port = undefined, address = '0.0.0.0') {
        return new Promise(resolve => {

            this._server = http.createServer((req, resp) => {

                debug('request %s %s', req.method, req.url);

                if (this._handler) {
                    this._handler(req, resp, this._nextHandler(req, resp))
                        .then(() => {
                            debug('%s request %s processed', this._name, req.url);
                        })
                        .catch(e => {
                            debug('%s request %s error %O', this._name, req.url, e.stack);
                            this._errorHandler(req, resp, e);
                        })
                    ;
                }
            });

            this._server.listen(port, address, () => {
                const addr = this.address;
                debug('%s address `%s` port %d bound', this._name, addr.address, addr.port);
                resolve();
            });

            this._server.addListener('connection', socket => {
                debug('%s new connection', this._name);

                this._sockets.push(socket);
                socket.addListener('close', () => {
                    debug('%s connection closed', this._name);
                    this._sockets = this._sockets.filter(sock => sock !== socket);
                });
            });
        });
    }

    /**
     * @returns {string}
     */
    get address () {
        return this._server.address();
    }

    stop () {
        debug('%s close', this._name);
        
        return new Promise(resolve => {
            this._server.close(() => {
                this._sockets.forEach(socket => socket.end());
                this._sockets = [];

                resolve();
            });
        });
    }

    /**
     * @param {(req, resp, next) => void} handler
     */
    setHandler (handler) {
        this._handler = handler;
    }

    _nextHandler (req, resp) {
        return async () => {
            debug('could not find a suited endpoint: %s %s', req.method, req.url);

            resp.statusCode = 404;
            resp.end();
        };
    }

    _errorHandler (req, resp, e) {
        resp.statusCode = 500;
        resp.write(e.stack);
        resp.end();
    }
}
