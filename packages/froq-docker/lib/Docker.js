'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _stream = require('stream');

var _events = require('events');

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _Image = require('./Image');

var _Image2 = _interopRequireDefault(_Image);

var _Container = require('./Container');

var _Container2 = _interopRequireDefault(_Container);

var _Inspection = require('./Inspection');

var _Inspection2 = _interopRequireDefault(_Inspection);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const json = arg => {
    try {
        return JSON.parse(arg);
    } catch (e) {
        return null;
    }
};

const stringstream = stringOrBuffer => {
    const stream = new _stream.Readable();
    stream.push(stringOrBuffer);
    stream.push(null);

    return stream;
};

const pick = obj => {
    const result = {};

    for (const k in obj) {
        const value = obj[k];
        if (value !== undefined) {
            result[k] = value;
        }
    }

    return result;
};

const promisifyResponseStream = (() => {
    var _ref = _asyncToGenerator(function* (res, onProgress = undefined) {
        if (onProgress) {
            res.on('progress', onProgress);
        }

        return yield new Promise(function (resolve, reject) {
            res.on('error', reject);
            res.on('end', resolve);
        });
    });

    return function promisifyResponseStream(_x) {
        return _ref.apply(this, arguments);
    };
})();

class Docker {

    static fromSocket(socketPath = undefined, https = false) {

        if (socketPath === undefined) {
            socketPath = _os2.default.type() === 'Windows_NT' ? '//./pipe/docker_engine' : '/var/run/docker.sock';
        }

        (0, _debug2.default)('create docker from sock file: %s', socketPath);
        return new Docker(socketPath, https);
    }

    constructor(socketPath, https) {
        this._socketPath = socketPath;
        this._https = https;
    }

    _request({
        path,
        method,
        query = undefined,
        bodyStream = undefined,
        bodyContentType = undefined,
        responseStream = false
    }) {
        var _this = this;

        return _asyncToGenerator(function* () {

            const headers = {};

            if (bodyContentType) {
                headers['Content-Type'] = bodyContentType;
            }

            let queryString = '';
            if (query) {
                queryString = Object.keys(query).map(function (key) {
                    return `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`;
                }).join('&');
            }

            const pathAndQuery = `${path}?${queryString}`;

            const opts = {
                socketPath: _this._socketPath,
                path: pathAndQuery,
                method,
                headers
            };

            const req = _http2.default.request(opts, function () {});

            return yield new Promise(function (resolve, reject) {
                req.on('error', reject);
                req.on('response', function (res) {

                    if (res.statusCode >= 400 && res.statusCode <= 599) {
                        const chunks = [];

                        res.on('data', function (chunk) {
                            chunks.push(chunk);
                        });

                        res.on('end', function () {
                            const errorResult = Buffer.concat(chunks).toString();
                            reject(new Error(`${res.statusCode} ${res.statusMessage}: ${pathAndQuery}\n\n${errorResult}`));
                        });

                        return;
                    }

                    if (responseStream) {

                        const ee = new _events.EventEmitter();

                        const parser = _JSONStream2.default.parse();
                        let onData, onError, onEnd;

                        const removeListener = function () {
                            parser.removeListener('data', onData);
                            parser.removeListener('error', onError);
                            parser.removeListener('end', onEnd);
                        };

                        onData = function (event) {
                            ee.emit('progress', event);
                        };

                        onError = function (e) {
                            removeListener();
                            ee.emit('error', e);
                        };

                        onEnd = function () {
                            removeListener();
                            ee.emit('end');
                        };

                        parser.on('data', onData);
                        parser.on('error', onError);
                        parser.on('end', onEnd);

                        res.pipe(parser);

                        return resolve(ee);
                    }

                    const chunks = [];

                    res.on('data', function (chunk) {
                        chunks.push(chunk);
                    });

                    res.on('end', function () {
                        const buffer = Buffer.concat(chunks);
                        const result = json(buffer);

                        resolve(result);
                    });
                });

                if (bodyStream) {

                    // auto end
                    bodyStream.pipe(req);
                } else {

                    req.end();
                }
            });
        })();
    }

    listContainers() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('list containers');
            return yield _this2._request({ method: 'GET', path: '/containers/json' });
        })();
    }

    listImages() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('list images');
            return yield _this3._request({ method: 'GET', path: '/images/json' });
        })();
    }

    /**
     * @return {Promise<Image>}
     */
    pull({ fromImage, tag = undefined }, onProgress = undefined) {
        var _this4 = this;

        return _asyncToGenerator(function* () {

            (0, _debug2.default)('pull image: %o', { fromImage, tag });

            const query = {
                fromImage
            };

            if (tag) {
                query.tag = tag;
            }

            const res = yield _this4._request({
                method: 'POST',
                path: '/images/create',
                query,
                responseStream: true
            });

            yield promisifyResponseStream(res, function (event) {
                (0, _debug2.default)('pull event: %o', event);

                if (onProgress) {
                    onProgress(event);
                }
            });

            let repoTag = fromImage;
            if (tag) {
                repoTag += `:${tag}`;
            }

            return new _Image2.default(_this4, repoTag);
        })();
    }

    createContainer({ data, name = undefined }) {
        var _this5 = this;

        return _asyncToGenerator(function* () {

            (0, _debug2.default)('create container %O', { data, name });

            const dataString = JSON.stringify(data);

            const body = yield _this5._request({
                method: 'POST',
                path: '/containers/create',
                query: pick({ name }),
                bodyStream: stringstream(dataString),
                bodyContentType: 'application/json'
            });

            const containerId = body && body.Id;
            return new _Container2.default(_this5, containerId);
        })();
    }

    startContainer({ id, detachKeys = undefined }) {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('start container: %o', { id, detachKeys });

            return yield _this6._request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/start`,
                query: pick({ detachKeys })
            });
        })();
    }

    stopContainer({ id, t = undefined }) {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('stop container: %o', { id, t });

            return yield _this7._request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/stop`,
                query: pick({ t })
            });
        })();
    }

    removeContainer({ id, v = undefined, force = undefined, link = undefined }) {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('remove container: %o', { id, v, force, link });

            return yield _this8._request({
                method: 'DELETE',
                path: `/containers/${encodeURIComponent(id)}`,
                query: pick({ v, force, link })
            });
        })();
    }

    inspectContainer({ id, size = undefined }) {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('inspect container: %o', { id, size });

            const data = yield _this9._request({
                method: 'GET',
                path: `/containers/${encodeURIComponent(id)}/json`,
                query: pick({ size })
            });

            return new _Inspection2.default(_this9, data);
        })();
    }

    waitForContainer({ id, condition = undefined }) {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('wait for container: %o', { id, condition });

            return yield _this10._request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/wait`,
                query: pick({ condition })
            });
        })();
    }

    build({ dockerfile = undefined, t, bodyStream, bodyContentType }, onProgress = undefined) {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('build image: %o', { dockerfile, t, bodyContentType });

            const res = yield _this11._request({
                method: 'POST',
                path: '/build',
                query: pick({
                    dockerfile,
                    t
                }),
                bodyStream,
                bodyContentType,
                responseStream: true
            });

            yield promisifyResponseStream(res, function (event) {
                (0, _debug2.default)('build event: %o', event);

                if (onProgress) {
                    onProgress(event);
                }
            });

            return new _Image2.default(_this11, t);
        })();
    }

    removeImage({ name, force = undefined, noprune = undefined }) {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('remove image: %o', { name, force, noprune });

            yield _this12._request({
                method: 'DELETE',
                path: `/images/${encodeURIComponent(name)}`,
                query: pick({ force, noprune })
            });
        })();
    }
}
exports.default = Docker;