'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _stream = require('stream');

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _Image = require('./Image');

var _Image2 = _interopRequireDefault(_Image);

var _Container = require('./Container');

var _Container2 = _interopRequireDefault(_Container);

var _Inspection = require('./Inspection');

var _Inspection2 = _interopRequireDefault(_Inspection);

var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

var _streamUtil = require('./stream-util');

var _DockerRawStream = require('./DockerRawStream');

var _DockerRawStream2 = _interopRequireDefault(_DockerRawStream);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

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

        this._connection = new _Connection2.default(socketPath);
    }

    listContainers() {
        var _this = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('list containers');
            return yield _this._connection.request({ method: 'GET', path: '/containers/json' }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }

    listImages() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('list images');
            return yield _this2._connection.request({ method: 'GET', path: '/images/json' }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }

    /**
     * @return {Promise<Image>}
     */
    pull({ fromImage, tag = undefined }, onProgress = undefined) {
        var _this3 = this;

        return _asyncToGenerator(function* () {

            (0, _debug2.default)('pull image: %o', { fromImage, tag });

            const query = {
                fromImage
            };

            let repoTag = fromImage;
            if (tag) {
                query.tag = tag;
                repoTag += `:${tag}`;
            }

            yield _this3._connection.request({
                method: 'POST',
                path: '/images/create',
                query
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.jsonStream).then((0, _streamUtil.progressStream)(function (data) {
                (0, _debug2.default)('pull event: %o', data);

                if (onProgress) {
                    onProgress(data);
                }
            }));

            return new _Image2.default(_this3, repoTag);
        })();
    }

    createContainer({ data, name = undefined }) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('create container %O', { data, name });

            const body = yield _this4._connection.request({
                method: 'POST',
                path: '/containers/create',
                query: pick({ name }),
                writeStream: stringstream(JSON.stringify(data)),
                headers: {
                    'content-type': 'application/json'
                }
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);

            const containerId = body && body.Id;
            return new _Container2.default(_this4, containerId);
        })();
    }

    startContainer({ id, detachKeys = undefined }) {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('start container: %o', { id, detachKeys });

            return yield _this5._connection.request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/start`,
                query: pick({ detachKeys })
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }

    stopContainer({ id, t = undefined }) {
        var _this6 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('stop container: %o', { id, t });

            return yield _this6._connection.request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/stop`,
                query: pick({ t })
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }

    removeContainer({ id, v = undefined, force = undefined, link = undefined }) {
        var _this7 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('remove container: %o', { id, v, force, link });

            return yield _this7._connection.request({
                method: 'DELETE',
                path: `/containers/${encodeURIComponent(id)}`,
                query: pick({ v, force, link })
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }

    inspectContainer({ id, size = undefined }) {
        var _this8 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('inspect container: %o', { id, size });

            const data = yield _this8._connection.request({
                method: 'GET',
                path: `/containers/${encodeURIComponent(id)}/json`,
                query: pick({ size })
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);

            return new _Inspection2.default(_this8, data);
        })();
    }

    waitForContainer({ id, condition = undefined }) {
        var _this9 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('wait for container: %o', { id, condition });

            return yield _this9._connection.request({
                method: 'POST',
                path: `/containers/${encodeURIComponent(id)}/wait`,
                query: pick({ condition })
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }

    attachContainer({ id }, streamCb) {
        var _this10 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('attach container %s', id);

            return yield new Promise(function (resolve, reject) {
                _this10._connection.request({
                    method: 'POST',
                    path: `/containers/${encodeURIComponent(id)}/attach`,
                    query: {
                        stream: '1',
                        stdout: '1',
                        stderr: '1'
                    },
                    headers: {
                        'content-type': 'application/vnd.docker.raw-stream',
                        upgrade: 'tcp',
                        connection: 'Upgrade'
                    },
                    upgrade: function (res_, socket, upgradeHeader) {
                        socket.on('error', function (err) {
                            (0, _debug2.default)('socket error container %s: %o', id, err);
                            reject(err);
                        });

                        // `socket.end` does not emit 'end' event, so with
                        // rawStream.end() also socket is ended and this is resolved

                        streamCb(new _DockerRawStream2.default(res_, socket, upgradeHeader, function () {
                            (0, _debug2.default)('socket ended container %s', id);
                            resolve();
                        }));
                    }
                });
            });
        })();
    }

    build({ dockerfile = undefined, t, writeStream, contentType }, onProgress = undefined) {
        var _this11 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('build image: %o', { dockerfile, t, contentType });

            yield _this11._connection.request({
                method: 'POST',
                path: '/build',
                query: pick({
                    dockerfile,
                    t
                }),
                writeStream,
                headers: {
                    'content-type': contentType
                }
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.jsonStream).then((0, _streamUtil.progressStream)(function (data) {
                (0, _debug2.default)('build event: %o', data);

                if (onProgress) {
                    onProgress(data);
                }
            }));

            return new _Image2.default(_this11, t);
        })();
    }

    removeImage({ name, force = undefined, noprune = undefined }) {
        var _this12 = this;

        return _asyncToGenerator(function* () {
            (0, _debug2.default)('remove image: %o', { name, force, noprune });

            yield _this12._connection.request({
                method: 'DELETE',
                path: `/images/${encodeURIComponent(name)}`,
                query: pick({ force, noprune })
            }).then(_streamUtil.checkStatusCode).then(_streamUtil.toJson);
        })();
    }
}
exports.default = Docker;