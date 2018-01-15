'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _froqUtil = require('froq-util');

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Container = function () {

    /**
     * 
     * @param {Dockerode.Container} container 
     */
    function Container(container) {
        _classCallCheck(this, Container);

        this._container = container;
    }

    _createClass(Container, [{
        key: 'start',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var startResult;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _froqUtil.log.info('start container');
                                _context.next = 3;
                                return this._container.start();

                            case 3:
                                startResult = _context.sent;
                                _context.next = 6;
                                return this.inspect();

                            case 6:
                                this._inspection = _context.sent;


                                _froqUtil.log.info('start container done');

                                return _context.abrupt('return', startResult);

                            case 9:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function start() {
                return _ref.apply(this, arguments);
            }

            return start;
        }()
    }, {
        key: 'stop',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var result;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _froqUtil.log.info('stop container');
                                _context2.next = 3;
                                return this._container.stop();

                            case 3:
                                result = _context2.sent;

                                _froqUtil.log.info('stop container done');
                                return _context2.abrupt('return', result);

                            case 6:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function stop() {
                return _ref2.apply(this, arguments);
            }

            return stop;
        }()
    }, {
        key: 'remove',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var result;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _froqUtil.log.info('remove container');
                                _context3.next = 3;
                                return this._container.remove();

                            case 3:
                                result = _context3.sent;

                                _froqUtil.log.info('remove container done');
                                return _context3.abrupt('return', result);

                            case 6:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function remove() {
                return _ref3.apply(this, arguments);
            }

            return remove;
        }()
    }, {
        key: 'inspect',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var result;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _froqUtil.log.info('inspect container');
                                _context4.next = 3;
                                return this._container.inspect();

                            case 3:
                                result = _context4.sent;

                                _froqUtil.log.info('inspect container done');

                                return _context4.abrupt('return', result);

                            case 6:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function inspect() {
                return _ref4.apply(this, arguments);
            }

            return inspect;
        }()
    }, {
        key: 'getHostAddresses',
        value: function getHostAddresses(port) {
            return this._inspection.NetworkSettings.Ports[port].map(function (x) {
                return x.HostIp + ':' + x.HostPort;
            }); // IPv6?
        }
    }, {
        key: 'getHostAddress',
        value: function getHostAddress(port) {
            var addresses = this.getHostAddresses(port);
            if (addresses.length === 0) {
                return null;
            }

            return addresses[0];
        }
    }]);

    return Container;
}();

exports.default = Container;
//# sourceMappingURL=Container.js.map