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

class Connection {

    constructor(socketPath) {
        this._socketPath = socketPath;
    }

    _qs(query) {
        if (!query) {
            return '';
        }

        return Object.keys(query).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&');
    }

    request({
        path,
        method,
        query = undefined,
        writeStream = undefined,
        headers = {},
        upgrade = undefined
    }) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const pathAndQuery = `${path}?${_this._qs(query)}`;

            const opts = {
                socketPath: _this._socketPath,
                path: pathAndQuery,
                method,
                headers
            };

            (0, _debug2.default)('%s %s: %o', method, pathAndQuery, { headers });
            const req = _http2.default.request(opts, function () {});

            if (upgrade) {
                req.on('upgrade', function (res, socket, upgradeHeader) {
                    (0, _debug2.default)('getting response upgrade %d "%s": %o', res.statusCode, res.statusMessage, { headers: res.headers });
                    upgrade(res, socket, upgradeHeader);
                });
            }

            return yield new Promise(function (resolve, reject) {
                req.on('error', reject);
                req.on('response', function (res) {
                    (0, _debug2.default)('getting response %d "%s": %o', res.statusCode, res.statusMessage, { headers: res.headers });
                    resolve(res);
                });

                if (writeStream) {
                    const pipeOpts = { end: !upgrade };
                    (0, _debug2.default)('writing stream to request: %o', pipeOpts);
                    writeStream.pipe(req, pipeOpts);
                }

                if (upgrade && !req.headersSent) {
                    (0, _debug2.default)('flush headers');
                    req.flushHeaders();
                }

                if (!writeStream && !upgrade) {
                    (0, _debug2.default)('request end');
                    req.end();
                }
            });
        })();
    }
}
exports.default = Connection;