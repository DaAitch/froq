'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _zlib = require('zlib');

var _zlib2 = _interopRequireDefault(_zlib);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _util = require('util');

var _util2 = _interopRequireDefault(_util);

var _tarStream = require('tar-stream');

var _tarStream2 = _interopRequireDefault(_tarStream);

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const debug = (0, _debug2.default)('froq-docker-util-buildstream');

const stat = _util2.default.promisify(_fs2.default.stat);
const readdir = _util2.default.promisify(_fs2.default.readdir);
const readlink = _util2.default.promisify(_fs2.default.readlink);

class BuildStream {
    constructor(gzip = true) {
        this._pack = _tarStream2.default.pack();
        this._gzip = gzip;

        this._stream = this._pack;
        if (gzip) {
            this._stream = this._pack.pipe(_zlib2.default.createGzip());
        }
    }

    get stream() {
        return this._stream;
    }

    get contentType() {
        return this._gzip ? 'application/tar+gzip' : 'application/tar';
    }

    addFileAsBuffer(name, stringOrBuffer) {
        var _this = this;

        return _asyncToGenerator(function* () {
            debug('add buffer at `%s`', name);

            return new Promise(function (resolve, reject) {
                _this._pack.entry({ name }, stringOrBuffer, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });
            });
        })();
    }

    addFileAsStream(name, size, streamCb) {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            debug('add stream at `%s` with size %d', name, size);

            return new Promise(function (resolve, reject) {
                const stream = _this2._pack.entry({ name, size }, function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }

                    resolve();
                });

                if (debug.enabled) {
                    stream.on('finish', function () {
                        debug('streaming `%s` finished', name);
                    });
                }

                streamCb(stream);
            });
        })();
    }

    addFileFromFile(filePath, name = '', followSymlinks = false) {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            debug('add file `%s` from `%s`: %o', name, filePath, { followSymlinks });

            yield _this3._addFileFromFile(filePath, name, followSymlinks, new Set(), true);
        })();
    }

    /**
     * @param {string} filePath
     * @param {string} name
     * @param {boolean} followSymlinks
     * @param {Set} fileSet is mutable, parallel adding files not possible
     * @param {boolean} isRoot
     */
    _addFileFromFile(filePath, name, followSymlinks, fileSet, isRoot) {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            const stats = yield stat(filePath);

            if (stats.isSymbolicLink()) {

                if (!followSymlinks) {
                    debug('will not add symlink folder `%s` from `%s`', name, filePath);
                    return;
                }

                const linkTarget = yield readlink(filePath);

                if (fileSet.has(linkTarget)) {
                    debug('symlink folder %s from `%s` -> `%s` already added', name, filePath, linkTarget);
                    return;
                }

                fileSet.add(linkTarget);
                debug('add symlink folder `%s` from `%s` -> `%s`', name, filePath, linkTarget);
                yield _this4._addFileFromFile(linkTarget, name, followSymlinks, fileSet, false);
                fileSet.delete(linkTarget);

                return;
            }

            if (stats.isDirectory()) {

                if (fileSet.has(filePath)) {
                    debug('directory `%s` from `%s already added', name, filePath);
                    return;
                }

                fileSet.add(filePath);
                debug('add directory `%s` from `%s`', name, filePath);

                const targetBasename = _path2.default.basename(filePath);

                const files = yield readdir(filePath);
                for (const file of files) {
                    const directoryFilePath = _path2.default.join(filePath, file);

                    let directoryFileName = name;
                    if (!isRoot) {
                        if (name) {
                            directoryFileName = _path2.default.join(name, targetBasename);
                        } else {
                            directoryFileName = targetBasename;
                        }
                    }

                    yield _this4._addFileFromFile(directoryFilePath, directoryFileName, followSymlinks, fileSet, false);
                }

                fileSet.delete(filePath);

                return;
            }

            if (stats.isFile()) {

                const targetBasename = _path2.default.basename(filePath);
                const targetName = name ? _path2.default.join(name, targetBasename) : targetBasename;

                if (fileSet.has(filePath)) {
                    debug('file `%s` from `%s` already added', targetName, filePath);
                    return;
                }

                yield _this4.addFileAsStream(targetName, stats.size, function (stream) {
                    _fs2.default.createReadStream(filePath).pipe(stream);
                });

                return;
            }

            debug('unknown file type at `%s`, not added', filePath);
        })();
    }

    end() {
        this._pack.finalize();
    }
}
exports.default = BuildStream;