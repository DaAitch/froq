'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

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

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var json = function json(arg) {
    try {
        return JSON.parse(arg);
    } catch (e) {
        return null;
    }
};

var stringstream = function stringstream(stringOrBuffer) {
    var stream = new _stream.Readable();
    stream.push(stringOrBuffer);
    stream.push(null);

    return stream;
};

var pick = function pick(obj) {
    var result = {};

    for (var k in obj) {
        var value = obj[k];
        if (value !== undefined) {
            result[k] = value;
        }
    }

    return result;
};

var promisifyResponseStream = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(res) {
        var onProgress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        if (onProgress) {
                            res.on('progress', onProgress);
                        }

                        _context.next = 3;
                        return new Promise(function (resolve, reject) {
                            res.on('error', reject);
                            res.on('end', resolve);
                        });

                    case 3:
                        return _context.abrupt('return', _context.sent);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function promisifyResponseStream(_x) {
        return _ref.apply(this, arguments);
    };
}();

var Docker = function () {
    _createClass(Docker, null, [{
        key: 'fromSocket',
        value: function fromSocket() {
            var socketPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;
            var https = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;


            if (socketPath === undefined) {
                socketPath = _os2.default.type() === 'Windows_NT' ? '//./pipe/docker_engine' : '/var/run/docker.sock';
            }

            (0, _debug2.default)('create docker from sock file: %s', socketPath);
            return new Docker(socketPath, https);
        }
    }]);

    function Docker(socketPath, https) {
        _classCallCheck(this, Docker);

        this._socketPath = socketPath;
        this._https = https;
    }

    _createClass(Docker, [{
        key: '_request',
        value: function () {
            var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(_ref3) {
                var path = _ref3.path,
                    method = _ref3.method,
                    _ref3$query = _ref3.query,
                    query = _ref3$query === undefined ? undefined : _ref3$query,
                    _ref3$bodyStream = _ref3.bodyStream,
                    bodyStream = _ref3$bodyStream === undefined ? undefined : _ref3$bodyStream,
                    _ref3$bodyContentLeng = _ref3.bodyContentLength,
                    bodyContentLength = _ref3$bodyContentLeng === undefined ? undefined : _ref3$bodyContentLeng,
                    _ref3$bodyContentType = _ref3.bodyContentType,
                    bodyContentType = _ref3$bodyContentType === undefined ? undefined : _ref3$bodyContentType,
                    _ref3$responseStream = _ref3.responseStream,
                    responseStream = _ref3$responseStream === undefined ? false : _ref3$responseStream;
                var headers, queryString, pathAndQuery, opts, req;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                headers = {};


                                if (bodyContentLength !== undefined) {
                                    headers['Content-Length'] = bodyContentLength;
                                }

                                if (bodyContentType) {
                                    headers['Content-Type'] = bodyContentType;
                                }

                                queryString = '';

                                if (query) {
                                    queryString = Object.keys(query).map(function (key) {
                                        return encodeURIComponent(key) + '=' + encodeURIComponent(query[key]);
                                    }).join('&');
                                }

                                pathAndQuery = path + '?' + queryString;
                                opts = {
                                    socketPath: this._socketPath,
                                    path: pathAndQuery,
                                    method: method,
                                    headers: headers
                                };
                                req = _http2.default.request(opts, function () {});
                                _context2.next = 10;
                                return new Promise(function (resolve, reject) {
                                    req.on('error', reject);
                                    req.on('response', function (res) {

                                        if (res.statusCode >= 400 && res.statusCode <= 599) {
                                            reject(new Error(res.statusCode + ' ' + res.statusMessage + ': ' + pathAndQuery));
                                            return;
                                        }

                                        if (responseStream) {

                                            var ee = new _events.EventEmitter();

                                            var parser = _JSONStream2.default.parse();
                                            var onData = void 0,
                                                onError = void 0,
                                                onEnd = void 0;

                                            var removeListener = function removeListener() {
                                                parser.removeListener('data', onData);
                                                parser.removeListener('error', onError);
                                                parser.removeListener('end', onEnd);
                                            };

                                            onData = function onData(event) {
                                                ee.emit('progress', event);
                                            };

                                            onError = function onError(e) {
                                                removeListener();
                                                ee.emit('error', e);
                                            };

                                            onEnd = function onEnd() {
                                                removeListener();
                                                ee.emit('end');
                                            };

                                            parser.on('data', onData);
                                            parser.on('error', onError);
                                            parser.on('end', onEnd);

                                            res.pipe(parser);

                                            return resolve(ee);
                                        }

                                        var chunks = [];

                                        res.on('data', function (chunk) {
                                            chunks.push(chunk);
                                        });

                                        res.on('end', function () {
                                            var buffer = Buffer.concat(chunks);
                                            var result = json(buffer);

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

                            case 10:
                                return _context2.abrupt('return', _context2.sent);

                            case 11:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _request(_x5) {
                return _ref2.apply(this, arguments);
            }

            return _request;
        }()
    }, {
        key: 'listContainers',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                (0, _debug2.default)('list containers');
                                _context3.next = 3;
                                return this._request({ method: 'GET', path: '/containers/json' });

                            case 3:
                                return _context3.abrupt('return', _context3.sent);

                            case 4:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function listContainers() {
                return _ref4.apply(this, arguments);
            }

            return listContainers;
        }()
    }, {
        key: 'listImages',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                (0, _debug2.default)('list images');
                                _context4.next = 3;
                                return this._request({ method: 'GET', path: '/images/json' });

                            case 3:
                                return _context4.abrupt('return', _context4.sent);

                            case 4:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function listImages() {
                return _ref5.apply(this, arguments);
            }

            return listImages;
        }()

        /**
         * @return {Promise<Image>}
         */

    }, {
        key: 'pull',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(_ref7) {
                var fromImage = _ref7.fromImage,
                    _ref7$tag = _ref7.tag,
                    tag = _ref7$tag === undefined ? undefined : _ref7$tag;
                var onProgress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
                var query, res, repoTag;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:

                                (0, _debug2.default)('pull image: %o', { fromImage: fromImage, tag: tag });

                                query = {
                                    fromImage: fromImage
                                };


                                if (tag) {
                                    query.tag = tag;
                                }

                                _context5.next = 5;
                                return this._request({
                                    method: 'POST',
                                    path: '/images/create',
                                    query: query,
                                    responseStream: true
                                });

                            case 5:
                                res = _context5.sent;
                                _context5.next = 8;
                                return promisifyResponseStream(res, function (event) {
                                    (0, _debug2.default)('pull event: %o', event);

                                    if (onProgress) {
                                        onProgress(event);
                                    }
                                });

                            case 8:
                                repoTag = fromImage;

                                if (tag) {
                                    repoTag += ':' + tag;
                                }

                                return _context5.abrupt('return', new _Image2.default(this, repoTag));

                            case 11:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function pull(_x6) {
                return _ref6.apply(this, arguments);
            }

            return pull;
        }()
    }, {
        key: 'createContainer',
        value: function () {
            var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(_ref9) {
                var data = _ref9.data,
                    _ref9$name = _ref9.name,
                    name = _ref9$name === undefined ? undefined : _ref9$name;
                var dataString, body, containerId;
                return regeneratorRuntime.wrap(function _callee6$(_context6) {
                    while (1) {
                        switch (_context6.prev = _context6.next) {
                            case 0:

                                (0, _debug2.default)('create container %O', { data: data, name: name });

                                dataString = JSON.stringify(data);
                                _context6.next = 4;
                                return this._request({
                                    method: 'POST',
                                    path: '/containers/create',
                                    query: pick({ name: name }),
                                    bodyStream: stringstream(dataString),
                                    bodyContentLength: Buffer.byteLength(dataString),
                                    bodyContentType: 'application/json'
                                });

                            case 4:
                                body = _context6.sent;
                                containerId = body && body.Id;
                                return _context6.abrupt('return', new _Container2.default(this, containerId));

                            case 7:
                            case 'end':
                                return _context6.stop();
                        }
                    }
                }, _callee6, this);
            }));

            function createContainer(_x8) {
                return _ref8.apply(this, arguments);
            }

            return createContainer;
        }()
    }, {
        key: 'startContainer',
        value: function () {
            var _ref10 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(_ref11) {
                var id = _ref11.id,
                    _ref11$detachKeys = _ref11.detachKeys,
                    detachKeys = _ref11$detachKeys === undefined ? undefined : _ref11$detachKeys;
                return regeneratorRuntime.wrap(function _callee7$(_context7) {
                    while (1) {
                        switch (_context7.prev = _context7.next) {
                            case 0:
                                (0, _debug2.default)('start container: %o', { id: id, detachKeys: detachKeys });

                                _context7.next = 3;
                                return this._request({
                                    method: 'POST',
                                    path: '/containers/' + encodeURIComponent(id) + '/start',
                                    query: pick({ detachKeys: detachKeys })
                                });

                            case 3:
                                return _context7.abrupt('return', _context7.sent);

                            case 4:
                            case 'end':
                                return _context7.stop();
                        }
                    }
                }, _callee7, this);
            }));

            function startContainer(_x9) {
                return _ref10.apply(this, arguments);
            }

            return startContainer;
        }()
    }, {
        key: 'stopContainer',
        value: function () {
            var _ref12 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(_ref13) {
                var id = _ref13.id,
                    _ref13$t = _ref13.t,
                    t = _ref13$t === undefined ? undefined : _ref13$t;
                return regeneratorRuntime.wrap(function _callee8$(_context8) {
                    while (1) {
                        switch (_context8.prev = _context8.next) {
                            case 0:
                                (0, _debug2.default)('stop container: %o', { id: id, t: t });

                                _context8.next = 3;
                                return this._request({
                                    method: 'POST',
                                    path: '/containers/' + encodeURIComponent(id) + '/stop',
                                    query: pick({ t: t })
                                });

                            case 3:
                                return _context8.abrupt('return', _context8.sent);

                            case 4:
                            case 'end':
                                return _context8.stop();
                        }
                    }
                }, _callee8, this);
            }));

            function stopContainer(_x10) {
                return _ref12.apply(this, arguments);
            }

            return stopContainer;
        }()
    }, {
        key: 'removeContainer',
        value: function () {
            var _ref14 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee9(_ref15) {
                var id = _ref15.id,
                    _ref15$v = _ref15.v,
                    v = _ref15$v === undefined ? undefined : _ref15$v,
                    _ref15$force = _ref15.force,
                    force = _ref15$force === undefined ? undefined : _ref15$force,
                    _ref15$link = _ref15.link,
                    link = _ref15$link === undefined ? undefined : _ref15$link;
                return regeneratorRuntime.wrap(function _callee9$(_context9) {
                    while (1) {
                        switch (_context9.prev = _context9.next) {
                            case 0:
                                (0, _debug2.default)('remove container: %o', { id: id, v: v, force: force, link: link });

                                _context9.next = 3;
                                return this._request({
                                    method: 'DELETE',
                                    path: '/containers/' + encodeURIComponent(id),
                                    query: pick({ v: v, force: force, link: link })
                                });

                            case 3:
                                return _context9.abrupt('return', _context9.sent);

                            case 4:
                            case 'end':
                                return _context9.stop();
                        }
                    }
                }, _callee9, this);
            }));

            function removeContainer(_x11) {
                return _ref14.apply(this, arguments);
            }

            return removeContainer;
        }()
    }, {
        key: 'inspectContainer',
        value: function () {
            var _ref16 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee10(_ref17) {
                var id = _ref17.id,
                    _ref17$size = _ref17.size,
                    size = _ref17$size === undefined ? undefined : _ref17$size;
                var data;
                return regeneratorRuntime.wrap(function _callee10$(_context10) {
                    while (1) {
                        switch (_context10.prev = _context10.next) {
                            case 0:
                                (0, _debug2.default)('inspect container: %o', { id: id, size: size });

                                _context10.next = 3;
                                return this._request({
                                    method: 'GET',
                                    path: '/containers/' + encodeURIComponent(id) + '/json',
                                    query: pick({ size: size })
                                });

                            case 3:
                                data = _context10.sent;
                                return _context10.abrupt('return', new _Inspection2.default(this, data));

                            case 5:
                            case 'end':
                                return _context10.stop();
                        }
                    }
                }, _callee10, this);
            }));

            function inspectContainer(_x12) {
                return _ref16.apply(this, arguments);
            }

            return inspectContainer;
        }()
    }, {
        key: 'waitForContainer',
        value: function () {
            var _ref18 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee11(_ref19) {
                var id = _ref19.id,
                    _ref19$condition = _ref19.condition,
                    condition = _ref19$condition === undefined ? undefined : _ref19$condition;
                return regeneratorRuntime.wrap(function _callee11$(_context11) {
                    while (1) {
                        switch (_context11.prev = _context11.next) {
                            case 0:
                                (0, _debug2.default)('wait for container: %o', { id: id, condition: condition });

                                _context11.next = 3;
                                return this._request({
                                    method: 'POST',
                                    path: '/containers/' + encodeURIComponent(id) + '/wait',
                                    query: pick({ condition: condition })
                                });

                            case 3:
                                return _context11.abrupt('return', _context11.sent);

                            case 4:
                            case 'end':
                                return _context11.stop();
                        }
                    }
                }, _callee11, this);
            }));

            function waitForContainer(_x13) {
                return _ref18.apply(this, arguments);
            }

            return waitForContainer;
        }()
    }, {
        key: 'build',
        value: function () {
            var _ref20 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee12(_ref21) {
                var _ref21$dockerfile = _ref21.dockerfile,
                    dockerfile = _ref21$dockerfile === undefined ? undefined : _ref21$dockerfile,
                    t = _ref21.t,
                    bodyStream = _ref21.bodyStream,
                    bodyContentType = _ref21.bodyContentType,
                    bodyContentLength = _ref21.bodyContentLength;
                var onProgress = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
                var res;
                return regeneratorRuntime.wrap(function _callee12$(_context12) {
                    while (1) {
                        switch (_context12.prev = _context12.next) {
                            case 0:
                                (0, _debug2.default)('build image: %o', { dockerfile: dockerfile, t: t, bodyContentLength: bodyContentLength, bodyContentType: bodyContentType });

                                _context12.next = 3;
                                return this._request({
                                    method: 'POST',
                                    path: '/build',
                                    query: pick({
                                        dockerfile: dockerfile,
                                        t: t
                                    }),
                                    bodyStream: bodyStream,
                                    bodyContentLength: bodyContentLength,
                                    bodyContentType: bodyContentType,
                                    responseStream: true
                                });

                            case 3:
                                res = _context12.sent;
                                _context12.next = 6;
                                return promisifyResponseStream(res, function (event) {
                                    (0, _debug2.default)('build event: %o', event);

                                    if (onProgress) {
                                        onProgress(event);
                                    }
                                });

                            case 6:
                                return _context12.abrupt('return', new _Image2.default(this, t));

                            case 7:
                            case 'end':
                                return _context12.stop();
                        }
                    }
                }, _callee12, this);
            }));

            function build(_x14) {
                return _ref20.apply(this, arguments);
            }

            return build;
        }()
    }, {
        key: 'removeImage',
        value: function () {
            var _ref22 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee13(_ref23) {
                var name = _ref23.name,
                    _ref23$force = _ref23.force,
                    force = _ref23$force === undefined ? undefined : _ref23$force,
                    _ref23$noprune = _ref23.noprune,
                    noprune = _ref23$noprune === undefined ? undefined : _ref23$noprune;
                return regeneratorRuntime.wrap(function _callee13$(_context13) {
                    while (1) {
                        switch (_context13.prev = _context13.next) {
                            case 0:
                                (0, _debug2.default)('remove image: %o', { name: name, force: force, noprune: noprune });

                                _context13.next = 3;
                                return this._request({
                                    method: 'DELETE',
                                    path: '/images/' + encodeURIComponent(name),
                                    query: pick({ force: force, noprune: noprune })
                                });

                            case 3:
                            case 'end':
                                return _context13.stop();
                        }
                    }
                }, _callee13, this);
            }));

            function removeImage(_x16) {
                return _ref22.apply(this, arguments);
            }

            return removeImage;
        }()
    }]);

    return Docker;
}();

exports.default = Docker;