'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

var _froqUtil = require('froq-util');

var _JSONStream = require('JSONStream');

var _JSONStream2 = _interopRequireDefault(_JSONStream);

var _os = require('os');

var _os2 = _interopRequireDefault(_os);

var _util = require('./util');

var _Container = require('./Container');

var _Container2 = _interopRequireDefault(_Container);

var _PullEvent = require('./PullEvent');

var _PullEvent2 = _interopRequireDefault(_PullEvent);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Docker = function () {
    _createClass(Docker, null, [{
        key: 'fromSocket',
        value: function fromSocket() {
            var socketPath = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;


            if (socketPath === undefined) {
                socketPath = _os2.default.type() === 'Windows_NT' ? '//./pipe/docker_engine' : '/var/run/docker.sock';
            }

            _froqUtil.log.info('create docker from sock file: ' + socketPath);
            return new Docker(new _dockerode2.default({ socketPath: socketPath }));
        }

        /**
         * 
         * @param {Dockerode} dockerode 
         */

    }]);

    function Docker(dockerode) {
        _classCallCheck(this, Docker);

        this._dockerode = dockerode;
    }

    /**
     * 
     * @param {string} repoTag 
     * @param {(event: PullEvent) => void} onProgress 
     */


    _createClass(Docker, [{
        key: 'pull',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(repoTag, onProgress) {
                var _this = this;

                var normalizedRepoTag;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                normalizedRepoTag = (0, _util.normalizeRepoTag)(repoTag);


                                _froqUtil.log.info('pull ' + repoTag + ' (' + normalizedRepoTag + ')');
                                return _context.abrupt('return', new Promise(function (resolve, reject) {
                                    _this._dockerode.pull(normalizedRepoTag, undefined, function (err, outStream) {
                                        if (err) {
                                            return reject(err);
                                        }

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
                                            if (event.error) {
                                                return onError(event.error);
                                            }

                                            if (onProgress) {
                                                onProgress(new _PullEvent2.default(event));
                                            }
                                        };

                                        onError = function onError(err) {
                                            removeListener();
                                            reject(err);
                                        };

                                        onEnd = function onEnd(event) {
                                            removeListener();
                                            _froqUtil.log.info('pull finish ' + repoTag);
                                            resolve();
                                        };

                                        parser.on('data', onData);
                                        parser.on('error', onError);
                                        parser.on('end', onEnd);

                                        outStream.pipe(parser);
                                    });
                                }));

                            case 3:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function pull(_x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return pull;
        }()
    }, {
        key: 'createContainer',
        value: function createContainer(repoTag) {
            var _this2 = this;

            var opts = {
                Image: (0, _util.normalizeRepoTag)(repoTag)
            };

            var builder = {
                bind: function bind(port) {
                    var hostPort = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';
                    var hostIp = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : undefined;

                    opts.PortBindings = opts.PortBindings || {};
                    opts.PortBindings[port] = opts.PortBindings[port] || [];

                    var binding = {
                        HostPort: hostPort
                    };
                    if (hostIp !== undefined) {
                        binding.HostIp = hostIp;
                    }
                    opts.PortBindings[port].push(binding);

                    return builder;
                },
                env: function env(envVar, value) {
                    opts.Env = opts.Env || [];
                    opts.Env.push(envVar + '=' + value);
                    return builder;
                },

                build: function () {
                    var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                        return regeneratorRuntime.wrap(function _callee2$(_context2) {
                            while (1) {
                                switch (_context2.prev = _context2.next) {
                                    case 0:
                                        _froqUtil.log.info('build container ' + repoTag);
                                        _context2.t0 = _Container2.default;
                                        _context2.next = 4;
                                        return _this2._dockerode.createContainer(opts);

                                    case 4:
                                        _context2.t1 = _context2.sent;
                                        return _context2.abrupt('return', new _context2.t0(_context2.t1));

                                    case 6:
                                    case 'end':
                                        return _context2.stop();
                                }
                            }
                        }, _callee2, _this2);
                    }));

                    return function build() {
                        return _ref2.apply(this, arguments);
                    };
                }()
            };

            return builder;
        }
    }]);

    return Docker;
}();

exports.default = Docker;
//# sourceMappingURL=Docker.js.map