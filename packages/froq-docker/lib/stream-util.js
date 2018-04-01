'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.checkStatusCode = exports.progressStream = exports.jsonStream = exports.toJson = exports.debugStream = exports.drainStream = undefined;

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const drainStream = exports.drainStream = (() => {
    var _ref = _asyncToGenerator(function* (res) {
        return new Promise(function (resolve, reject) {
            const chunks = [];

            res.on('error', reject);
            res.on('data', function (chunk) {
                chunks.push(chunk);
            });

            res.on('end', function () {
                const result = Buffer.concat(chunks);
                resolve(result);
            });
        });
    });

    return function drainStream(_x) {
        return _ref.apply(this, arguments);
    };
})();

const debugStream = exports.debugStream = (() => {
    var _ref2 = _asyncToGenerator(function* (res) {
        return new Promise(function (resolve, reject) {

            res.on('error', function (err) {
                (0, _debug2.default)('debug stream error: %o', err);
                reject(err);
            });
            res.on('data', function (chunk) {
                (0, _debug2.default)('debug stream: %s', chunk.toString());
            });

            res.on('end', function () {
                (0, _debug2.default)('debug stream end');
                resolve();
            });
        });
    });

    return function debugStream(_x2) {
        return _ref2.apply(this, arguments);
    };
})();

const toJson = exports.toJson = (() => {
    var _ref3 = _asyncToGenerator(function* (res) {
        if (res.statusCode === 204) {
            return undefined;
        }

        const chunk = yield drainStream(res);
        const string = chunk.toString();

        try {
            return JSON.parse(string);
        } catch (e) {
            (0, _debug2.default)('error reading json: %o, %s', e, string);
            throw e;
        }
    });

    return function toJson(_x3) {
        return _ref3.apply(this, arguments);
    };
})();

const jsonStream = exports.jsonStream = (() => {
    var _ref4 = _asyncToGenerator(function* (stream) {
        return new Promise(function (resolve) {
            const parser = _JSONStream2.default.parse();
            stream.pipe(parser);
            resolve(parser);
        });
    });

    return function jsonStream(_x4) {
        return _ref4.apply(this, arguments);
    };
})();

const progressStream = exports.progressStream = onProgress => (() => {
    var _ref5 = _asyncToGenerator(function* (stream) {
        if (onProgress) {
            stream.on('data', onProgress);
        }

        return yield new Promise(function (resolve, reject) {
            stream.on('error', reject);
            stream.on('end', resolve);
        });
    });

    return function (_x5) {
        return _ref5.apply(this, arguments);
    };
})();

const checkStatusCode = exports.checkStatusCode = res => {

    if (res.statusCode >= 400 && res.statusCode <= 599) {
        (0, _debug2.default)('error status code %s "%s"', res.statusCode, res.statusMessage);

        const err = new Error(res);
        err.response = res;
        throw err;
    }

    return res;
};