'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Server {

    /**
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
     * @param {number?} port
     * @param {string?} address
     */
    start(port = undefined, address = undefined) {
        return new Promise(resolve => {

            this._server = _http2.default.createServer((req, resp) => {

                (0, _debug2.default)('request %s %s', req.method, req.url);

                if (this._handler) {
                    this._handler(req, resp, this._nextHandler(req, resp)).then(() => {
                        (0, _debug2.default)('%s request %s processed', this._name, req.url);
                    }).catch(e => {
                        (0, _debug2.default)('%s request %s error %O', this._name, req.url, e.stack);
                        this._errorHandler(req, resp, e);
                    });
                }
            });

            this._server.listen(port, address, () => {
                (0, _debug2.default)('%s port %d bound', this._name, this.address.port);
                resolve();
            });

            this._server.addListener('connection', socket => {
                (0, _debug2.default)('%s new connection', this._name);

                this._sockets.push(socket);
                socket.addListener('close', () => {
                    (0, _debug2.default)('%s connection closed', this._name);
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
        (0, _debug2.default)('%s close', this._name);

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
    setHandler(handler) {
        this._handler = handler;
    }

    _nextHandler(req, resp) {
        return _asyncToGenerator(function* () {
            (0, _debug2.default)('could not find a suited endpoint: %s %s', req.method, req.url);

            resp.statusCode = 404;
            resp.end();
        });
    }

    _errorHandler(req, resp, e) {
        resp.statusCode = 500;
        resp.write(e.stack);
        resp.end();
    }
}
exports.default = Server;