'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var nextTick = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        _context.next = 2;
                        return new Promise(function (resolve, reject) {
                            return process.nextTick(resolve);
                        });

                    case 2:
                        return _context.abrupt('return', _context.sent);

                    case 3:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function nextTick() {
        return _ref.apply(this, arguments);
    };
}();
var timeout = function () {
    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(millis) {
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        _context2.next = 2;
                        return new Promise(function (resolve, reject) {
                            return setTimeout(resolve, millis);
                        });

                    case 2:
                        return _context2.abrupt('return', _context2.sent);

                    case 3:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, undefined);
    }));

    return function timeout(_x) {
        return _ref2.apply(this, arguments);
    };
}();

exports.default = function () {
    var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(_ref4) {
        var try_ = _ref4.try,
            _ref4$total = _ref4.total,
            total = _ref4$total === undefined ? 10000 : _ref4$total,
            _ref4$defer = _ref4.defer,
            defer = _ref4$defer === undefined ? undefined : _ref4$defer,
            _ref4$max = _ref4.max,
            max = _ref4$max === undefined ? 100 : _ref4$max;
        var i, now, exceptions, err;
        return regeneratorRuntime.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        i = 0;
                        now = Date.now();
                        exceptions = [];

                    case 3:
                        if (!(now + total > Date.now() && i < max)) {
                            _context3.next = 24;
                            break;
                        }

                        _context3.prev = 4;

                        ++i;
                        _context3.next = 8;
                        return try_();

                    case 8:
                        return _context3.abrupt('return', _context3.sent);

                    case 11:
                        _context3.prev = 11;
                        _context3.t0 = _context3['catch'](4);

                        (0, _debug2.default)('try %d failed', i);

                    case 14:
                        if (!(defer !== undefined)) {
                            _context3.next = 20;
                            break;
                        }

                        (0, _debug2.default)('wait %d ms', defer);
                        _context3.next = 18;
                        return timeout(defer);

                    case 18:
                        _context3.next = 22;
                        break;

                    case 20:
                        _context3.next = 22;
                        return nextTick();

                    case 22:
                        _context3.next = 3;
                        break;

                    case 24:
                        err = new Error('retry failed ' + i + ' times');

                        err.exceptions = exceptions;
                        throw err;

                    case 27:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, undefined, [[4, 11]]);
    }));

    return function (_x2) {
        return _ref3.apply(this, arguments);
    };
}();