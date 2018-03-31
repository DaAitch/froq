"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Container = function () {

    /**
     * @param {Docker} docker
     * @param {string} id
     */
    function Container(docker, id) {
        _classCallCheck(this, Container);

        this._docker = docker;
        this._id = id;
    }

    _createClass(Container, [{
        key: "start",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                var detachKeys = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._docker.startContainer({
                                    id: this._id,
                                    detachKeys: detachKeys
                                });

                            case 2:
                                return _context.abrupt("return", _context.sent);

                            case 3:
                            case "end":
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
        key: "stop",
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var t = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this._docker.stopContainer({
                                    id: this._id,
                                    t: t
                                });

                            case 2:
                                return _context2.abrupt("return", _context2.sent);

                            case 3:
                            case "end":
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
        key: "wait",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var condition = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this._docker.waitForContainer({
                                    id: this._id,
                                    condition: condition
                                });

                            case 2:
                                return _context3.abrupt("return", _context3.sent);

                            case 3:
                            case "end":
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function wait() {
                return _ref3.apply(this, arguments);
            }

            return wait;
        }()
    }, {
        key: "remove",
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var _ref5 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref5$force = _ref5.force,
                    force = _ref5$force === undefined ? undefined : _ref5$force,
                    _ref5$link = _ref5.link,
                    link = _ref5$link === undefined ? undefined : _ref5$link,
                    _ref5$v = _ref5.v,
                    v = _ref5$v === undefined ? undefined : _ref5$v;

                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this._docker.removeContainer({
                                    id: this._id,
                                    force: force,
                                    link: link,
                                    v: v
                                });

                            case 2:
                                return _context4.abrupt("return", _context4.sent);

                            case 3:
                            case "end":
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function remove() {
                return _ref4.apply(this, arguments);
            }

            return remove;
        }()
    }, {
        key: "inspect",
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5() {
                var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._docker.inspectContainer({
                                    id: this._id,
                                    size: size
                                });

                            case 2:
                                return _context5.abrupt("return", _context5.sent);

                            case 3:
                            case "end":
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function inspect() {
                return _ref6.apply(this, arguments);
            }

            return inspect;
        }()
    }, {
        key: "id",
        get: function get() {
            return this._id;
        }
    }]);

    return Container;
}();

exports.default = Container;