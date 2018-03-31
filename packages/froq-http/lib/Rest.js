'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _httpProxy = require('http-proxy');

var _httpProxy2 = _interopRequireDefault(_httpProxy);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Rest {

    /**
     * @param {Route} route
     */
    constructor({ route, router, placeholders, server }) {
        this._route = route;
        this._router = router;
        this._placeholders = placeholders;
        this._server = server;
    }

    type(type) {
        this._type = (0, _util.contentTypeLookupOrThrow)(type);
        return this;
    }

    respond(respondParam) {
        var _this = this;

        this._router.add(this._route);
        this._route.processor = (() => {
            var _ref = _asyncToGenerator(function* (req, resp, result) {
                let innerRespondParam = respondParam;

                result = (0, _util.resultByPlaceholders)(_this._placeholders, result);

                if (innerRespondParam instanceof Function) {
                    innerRespondParam = innerRespondParam({
                        body: yield (0, _util.reqBodyForType)(req),
                        result
                    });
                }

                if (innerRespondParam === null || innerRespondParam === undefined) {
                    resp.end();
                    return;
                }

                const isQResponse = typeof innerRespondParam === 'object' && _util.qSymbol in innerRespondParam;

                let type;

                if (isQResponse) {
                    if ('status' in innerRespondParam) {
                        resp.statusCode = innerRespondParam.status;
                    }

                    if ('type' in innerRespondParam) {
                        (0, _debug2.default)('using type %s from response type', innerRespondParam.type);
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
                        (0, _debug2.default)('using type %s from rest type', _this._type);
                        type = _this._type;
                    } else if (_this._server.type !== undefined) {
                        (0, _debug2.default)('using type %s from server type', _this._server._type);
                        type = _this._server._type;
                    }

                    if (type) {
                        resp.setHeader('content-type', type);
                    } else {
                        (0, _debug2.default)('unknown type');
                    }
                }

                if (!isQResponse) {
                    resp.write((0, _util.respBodyForType)(type, innerRespondParam));
                }

                resp.end();
            });

            return function (_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            };
        })();

        return this._server;
    }

    proxy(expr) {

        let target = expr;
        if (typeof expr !== 'string') {
            target = `http://${expr.address}`;
        }

        const proxy = _httpProxy2.default.createProxyServer({
            target,
            ws: true,
            changeOrigin: true
        });

        this._route.processor = (req, resp) => {
            return new Promise((resolve, reject) => {
                (0, _debug2.default)('using proxy: %s %s -> %s(%s)', req.method, req.url, this._server._name, target);
                proxy.web(req, resp);

                resp.on('finish', resolve).on('error', reject);
            });
        };

        this._router.add(this._route);

        return this._server;
    }
}
exports.default = Rest;