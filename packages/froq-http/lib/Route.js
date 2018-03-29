'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Route = function () {
    function Route() {
        _classCallCheck(this, Route);

        this.matcher = null;
        this.processer = null;
    }

    _createClass(Route, [{
        key: 'handle',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, resp, next) {
                var result, procResult;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                result = this.matcher(req);

                                if (!(result === false)) {
                                    _context.next = 5;
                                    break;
                                }

                                _context.next = 4;
                                return next();

                            case 4:
                                return _context.abrupt('return');

                            case 5:
                                procResult = this.processor(req, resp, result);
                                _context.next = 8;
                                return Promise.resolve(procResult);

                            case 8:
                                (0, _debug2.default)('route processed');

                                if (!resp.finished) {
                                    resp.end();
                                }

                            case 10:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function handle(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return handle;
        }()
    }, {
        key: 'placeholderCount',
        get: function get() {
            return this.matcher.placeholderCount;
        }
    }]);

    return Route;
}();

exports.default = Route;