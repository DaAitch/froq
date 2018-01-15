'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _froqUtil = require('froq-util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {

    /**
     * 
     * @param {string} name 
     */
    function Server() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'server';

        _classCallCheck(this, Server);

        this._name = name;
        this._sockets = [];
    }

    /**
     * @returns {string}
     */


    _createClass(Server, [{
        key: 'start',


        /**
         * 
         * @param {number?} port 
         * @param {string?} address 
         */
        value: function start() {
            var _this = this;

            var port = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
            var address = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

            return new Promise(function (resolve, reject) {

                _this._server = _http2.default.createServer(function (req, resp) {
                    _froqUtil.log.info(req.method + ' ' + req.url);

                    if (_this._handler) {
                        _this._handler(req, resp, _this._nextHandler(req, resp)).then(function () {
                            _froqUtil.log.info(_this._name + ' request ' + req.url + ' processed.');
                        }).catch(function (e) {
                            _froqUtil.log.error(_this._name + ' request ' + req.url + ' error: ' + e.stack);
                            _this._errorHandler(req, resp, e);
                        });
                        ;
                    }
                });

                _this._server.listen(port, address, function () {
                    _froqUtil.log.info(_this._name + ' port ' + _this.address.port + ' bound.');
                    resolve();
                });

                _this._server.addListener('connection', function (socket) {
                    _froqUtil.log.debug(_this._name + ' new connection.');
                    _this._sockets.push(socket);
                    socket.addListener('close', function () {
                        _froqUtil.log.debug(_this._name + ' connection close.');
                        _this._sockets = _this._sockets.filter(function (sock) {
                            return sock !== socket;
                        });
                    });
                });
            });
        }

        /**
         * @returns {string}
         */

    }, {
        key: 'stop',
        value: function stop() {
            var _this2 = this;

            _froqUtil.log.info(this._name + ' close');
            return new Promise(function (resolve, reject) {
                _this2._server.close(function () {
                    _this2._sockets.forEach(function (socket) {
                        return socket.end();
                    });
                    _this2._sockets = [];

                    resolve();
                });
            });
        }

        /**
         * 
         * @param {(req, resp, next) => void} handler 
         */

    }, {
        key: 'setHandler',
        value: function setHandler(handler) {
            this._handler = handler;
        }
    }, {
        key: '_nextHandler',
        value: function _nextHandler(req, resp) {
            var _this3 = this;

            return _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _froqUtil.log.error('could not find a suited endpoint: ' + req.method + ' ' + req.url);

                                resp.statusCode = 404;
                                resp.end();

                            case 3:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, _this3);
            }));
        }
    }, {
        key: '_errorHandler',
        value: function _errorHandler(req, resp, e) {
            resp.statusCode = 500;
            resp.write(e.stack);
            resp.end();
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        }
    }, {
        key: 'address',
        get: function get() {
            return this._server.address();
        }
    }]);

    return Server;
}();

exports.default = Server;
//# sourceMappingURL=Connection.js.map