import http from 'http';
import { log } from 'froq-util';

export default class Server {

    /**
     * 
     * @param {string} name 
     */
    constructor(name = 'server') {
        this._name = name;
        this._sockets = [];
    }

    /**
     * @returns {string}
     */
    get name() {
        return this._name;
    }

    /**
     * 
     * @param {number?} port 
     * @param {string?} address 
     */
    start(port = undefined, address = undefined) {
        return new Promise((resolve, reject) => {

            this._server = http.createServer((req, resp) => {
                log.info(`${req.method} ${req.url}`);

                if (this._handler) {
                    this._handler(req, resp, this._nextHandler(req, resp))
                        .then(() => {
                            log.info(`${this._name} request ${req.url} processed.`);
                        })
                        .catch(e => {
                            log.error(`${this._name} request ${req.url} error: ${e.stack}`);
                            this._errorHandler(req, resp, e);
                        });
                    ;
                }
            });

            this._server.listen(port, address, () => {
                log.info(`${this._name} port ${this.address.port} bound.`);
                resolve();
            });

            this._server.addListener('connection', socket => {
                log.debug(`${this._name} new connection.`);
                this._sockets.push(socket);
                socket.addListener('close', () => {
                    log.debug(`${this._name} connection close.`);
                    this._sockets = this._sockets.filter(sock => sock !== socket);
                });
            });
        });
    }

    /**
     * @returns {string}
     */
    get address() {
        return this._server.address();
    }

    stop() {
        log.info(`${this._name} close`);
        return new Promise((resolve, reject) => {
            this._server.close(() => {
                this._sockets.forEach(socket => socket.end());
                this._sockets = [];

                resolve();
            });
        });
    }

    /**
     * 
     * @param {(req, resp, next) => void} handler 
     */
    setHandler(handler) {
        this._handler = handler;
    }

    _nextHandler(req, resp) {
        return async () => {
            log.error(`could not find a suited endpoint: ${req.method} ${req.url}`);

            resp.statusCode = 404;
            resp.end();
        };
    }

    _errorHandler(req, resp, e) {
        resp.statusCode = 500;
        resp.write(e.stack);
        resp.end();
    }
}