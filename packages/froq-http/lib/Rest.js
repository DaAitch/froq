'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _froqUtil = require('froq-util');

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Rest = function () {

    /**
     * 
     * @param {Route} route 
     */
    function Rest(_ref) {
        var route = _ref.route,
            router = _ref.router,
            placeholders = _ref.placeholders,
            server = _ref.server;

        _classCallCheck(this, Rest);

        this._route = route;
        this._router = router;
        this._placeholders = placeholders;
        this._server = server;
    }

    _createClass(Rest, [{
        key: 'type',
        value: function type(_type) {
            this._type = (0, _util.contentTypeLookupOrThrow)(_type);
            return this;
        }
    }, {
        key: 'respond',
        value: function respond(respondParam) {
            var _this = this;

            this._router.add(this._route);
            this._route.processor = function () {
                var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(req, resp, result) {
                    var innerRespondParam, isQResponse, type;
                    return regeneratorRuntime.wrap(function _callee$(_context) {
                        while (1) {
                            switch (_context.prev = _context.next) {
                                case 0:
                                    innerRespondParam = respondParam;


                                    result = (0, _util.resultByPlaceholders)(_this._placeholders, result);

                                    if (!(innerRespondParam instanceof Function)) {
                                        _context.next = 10;
                                        break;
                                    }

                                    _context.t0 = innerRespondParam;
                                    _context.next = 6;
                                    return (0, _util.reqBodyForType)(req);

                                case 6:
                                    _context.t1 = _context.sent;
                                    _context.t2 = result;
                                    _context.t3 = {
                                        body: _context.t1,
                                        result: _context.t2
                                    };
                                    innerRespondParam = (0, _context.t0)(_context.t3);

                                case 10:
                                    if (!(innerRespondParam === null || innerRespondParam === undefined)) {
                                        _context.next = 13;
                                        break;
                                    }

                                    resp.end();
                                    return _context.abrupt('return');

                                case 13:
                                    isQResponse = (typeof innerRespondParam === 'undefined' ? 'undefined' : _typeof(innerRespondParam)) === 'object' && _util.qSymbol in innerRespondParam;
                                    type = undefined;


                                    if (isQResponse) {
                                        if ('status' in innerRespondParam) {
                                            resp.statusCode = innerRespondParam.status;
                                        }

                                        if ('type' in innerRespondParam) {
                                            _froqUtil.log.debug('using type ' + innerRespondParam.type + ' from response type');
                                            type = (0, _util.contentTypeLookupOrThrow)(innerRespondParam.type);
                                            resp.setHeader('content-type', type);
                                        }

                                        if ('body' in innerRespondParam) {
                                            resp.write((0, _util.respBodyForType)(type, innerRespondParam.body));
                                        }

                                        if ('text' in innerRespondParam) {
                                            resp.write(innerRespondParam.text);
                                        }
                                    }

                                    if (!type) {
                                        if (_this._type !== undefined) {
                                            _froqUtil.log.debug('using type ' + _this._type + ' from rest type');
                                            type = _this._type;
                                        } else if (_this._server.type !== undefined) {
                                            _froqUtil.log.debug('using type ' + _this._server._type + ' from server type');
                                            type = _this._server._type;
                                        }

                                        if (type) {
                                            resp.setHeader('content-type', type);
                                        } else {
                                            _froqUtil.log.error('unknown type!');
                                        }
                                    }

                                    if (!isQResponse) {
                                        resp.write((0, _util.respBodyForType)(type, innerRespondParam));
                                    }

                                    resp.end();

                                case 19:
                                case 'end':
                                    return _context.stop();
                            }
                        }
                    }, _callee, _this);
                }));

                return function (_x, _x2, _x3) {
                    return _ref2.apply(this, arguments);
                };
            }();

            return this._server;
        }
    }, {
        key: 'proxy',
        value: function proxy(expr) {
            var _this2 = this;

            var name = expr;
            var target = expr;
            if (typeof expr !== 'string') {
                name = expr.name;
                target = 'http://' + expr.address;
            }

            var proxy = _httpProxy2.default.createProxyServer({
                target: target,
                ws: true,
                changeOrigin: true
            });

            this._route.processor = function (req, resp, result) {
                return new Promise(function (resolve, reject) {
                    _froqUtil.log.info('using proxy: ' + req.method + ' ' + req.url + ' -> ' + _this2._server._name + '(' + target + ')');
                    proxy.web(req, resp);

                    resp.on('finish', resolve).on('error', reject);
                });
            };

            this._router.add(this._route);

            return this._server;
        }
    }]);

    return Rest;
}();

exports.default = Rest;
//# sourceMappingURL=Rest.js.map