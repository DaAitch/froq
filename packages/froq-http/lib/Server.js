'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _froqUtil = require('froq-util');

var _Router = require('./Router');

var _Router2 = _interopRequireDefault(_Router);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

var _Rest = require('./Rest');

var _Rest2 = _interopRequireDefault(_Rest);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Server = function () {
    function Server(name, port) {
        var _this = this;

        _classCallCheck(this, Server);

        this._name = name;
        this._port = port;

        this._connection = new _Connection2.default(name);
        this._router = new _Router2.default();

        this._connection.setHandler(function (req, resp, next) {
            return _this._router.handle(req, resp, next);
        });
    }

    _createClass(Server, [{
        key: 'start',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._connection.start(this._port);

                            case 2:
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
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this._connection.stop();

                            case 2:
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
        key: 'url',
        value: function url() {
            var path = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

            return 'http://' + this.address + path;
        }
    }, {
        key: 'type',
        value: function type(_type) {
            this._type = (0, _util.contentTypeLookupOrThrow)(_type);
            return this;
        }
    }, {
        key: 'rest',
        value: function rest(strings) {
            var _this2 = this;

            for (var _len = arguments.length, placeholders = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                placeholders[_key - 1] = arguments[_key];
            }

            var method = void 0;

            var _transformRestTemplat = (0, _util.transformRestTemplate)(strings, placeholders);

            var _transformRestTemplat2 = _slicedToArray(_transformRestTemplat, 3);

            method = _transformRestTemplat2[0];
            strings = _transformRestTemplat2[1];
            placeholders = _transformRestTemplat2[2];


            var route = new _Route2.default();
            var matcher = _util.createPathMatcherFromTemplate.apply(undefined, [strings].concat(_toConsumableArray(placeholders)));

            route.matcher = function (req) {
                if (method && req.method !== method) {
                    return false;
                }

                var result = matcher(req.url);
                _froqUtil.log.debug(_this2._name + ': ' + req.url + ' ' + (result !== false ? 'matches' : 'not matches') + ' ' + strings.join('...'));

                return result;
            };

            route.processor = function () {
                throw new Error('processor missing for ' + strings.join('...') + '.');
            };

            var router = this._router;
            var server = this;
            return new _Rest2.default({ route: route, router: router, placeholders: placeholders, server: server });
        }
    }, {
        key: 'name',
        get: function get() {
            return this._name;
        }
    }, {
        key: 'address',
        get: function get() {
            var address = this._connection.address;
            switch (address.family) {
                case 'IPv4':
                    {
                        return this._connection.address.address + ':' + this._connection.address.port;
                    }
                case 'IPv6':
                    {
                        return '[' + this._connection.address.address + ']:' + this._connection.address.port;
                    }
            }
        }
    }]);

    return Server;
}();

exports.default = Server;
//# sourceMappingURL=Server.js.map