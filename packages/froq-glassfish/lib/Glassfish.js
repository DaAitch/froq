'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _froqUtil = require('froq-util');

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _url = require('url');

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _OperationResult = require('./OperationResult');

var _OperationResult2 = _interopRequireDefault(_OperationResult);

var _timers = require('timers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultRetry = 10;
var defaultWaitMillis = 1000;

var Glassfish = function () {
    function Glassfish(url, user, password) {
        _classCallCheck(this, Glassfish);

        this._url = url;
        this._user = user;
        this._password = password;
        this._gftoken = undefined;
        this._textAppendNextUrl = undefined;
    }

    _createClass(Glassfish, [{
        key: '_restUrl',
        value: function _restUrl(path) {
            return this._url + path;
        }
    }, {
        key: '_fetch',
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(url, opts) {
                var _ref2 = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : { retry: defaultRetry, waitMillis: defaultWaitMillis },
                    _ref2$retry = _ref2.retry,
                    retry = _ref2$retry === undefined ? defaultRetry : _ref2$retry,
                    _ref2$waitMillis = _ref2.waitMillis,
                    waitMillis = _ref2$waitMillis === undefined ? defaultWaitMillis : _ref2$waitMillis;

                var response;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:

                                opts = _extends({}, opts);
                                opts.headers = _extends({
                                    'x-requested-by': 'GlassFish REST HTML interface', // important -.-
                                    'content-type': 'application/json'
                                }, this._gftoken ? {
                                    cookie: 'gfresttoken=' + this._gftoken
                                } : {
                                    authorization: 'Basic ' + new Buffer(this._user + ':' + this._password).toString('base64')
                                }, opts.headers || {});

                                _froqUtil.log.info('fetch ' + url + ' with ' + JSON.stringify(opts));
                                response = void 0;
                                _context.prev = 4;
                                _context.next = 7;
                                return (0, _nodeFetch2.default)(url, opts);

                            case 7:
                                response = _context.sent;
                                return _context.abrupt('return', response);

                            case 11:
                                _context.prev = 11;
                                _context.t0 = _context['catch'](4);

                                if (!(retry <= 0)) {
                                    _context.next = 15;
                                    break;
                                }

                                throw _context.t0;

                            case 15:

                                _froqUtil.log.warning('could not fetch ' + url + ', will retry ' + retry + 'x in ' + waitMillis + 'ms');

                            case 16:

                                --retry;
                                _context.next = 19;
                                return new Promise(function (resolve, reject) {
                                    (0, _timers.setTimeout)(resolve, waitMillis);
                                });

                            case 19:
                                return _context.abrupt('return', this._fetch(url, opts, { retry: retry, waitMillis: waitMillis }));

                            case 20:
                            case 'end':
                                return _context.stop();
                        }
                    }
                }, _callee, this, [[4, 11]]);
            }));

            function _fetch(_x, _x2) {
                return _ref.apply(this, arguments);
            }

            return _fetch;
        }()
    }, {
        key: '_auth',
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var response, json, result, gftoken;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                if (!this._gftoken) {
                                    _context2.next = 2;
                                    break;
                                }

                                return _context2.abrupt('return');

                            case 2:
                                _context2.next = 4;
                                return this._fetch(this._restUrl('/management/sessions.json'), {
                                    method: 'POST',
                                    body: JSON.stringify({})
                                });

                            case 4:
                                response = _context2.sent;
                                _context2.next = 7;
                                return response.json();

                            case 7:
                                json = _context2.sent;
                                result = new _OperationResult2.default(json);

                                if (result.isSuccess()) {
                                    _context2.next = 11;
                                    break;
                                }

                                throw result.asError();

                            case 11:
                                gftoken = json.extraProperties.token;

                                _froqUtil.log.info('got token ' + gftoken);
                                this._gftoken = gftoken;

                            case 14:
                            case 'end':
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function _auth() {
                return _ref3.apply(this, arguments);
            }

            return _auth;
        }()
    }, {
        key: 'logs',
        value: function () {
            var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3() {
                var response;
                return regeneratorRuntime.wrap(function _callee3$(_context3) {
                    while (1) {
                        switch (_context3.prev = _context3.next) {
                            case 0:
                                _context3.next = 2;
                                return this._auth();

                            case 2:
                                _context3.next = 4;
                                return this._fetch(this._restUrl('/management/domain/view-log'), {
                                    method: 'GET',
                                    body: JSON.stringify({})
                                });

                            case 4:
                                response = _context3.sent;


                                this._textAppendNextUrl = response.headers['X-Text-Append-Next'];

                                _context3.next = 8;
                                return response.text();

                            case 8:
                                return _context3.abrupt('return', _context3.sent);

                            case 9:
                            case 'end':
                                return _context3.stop();
                        }
                    }
                }, _callee3, this);
            }));

            function logs() {
                return _ref4.apply(this, arguments);
            }

            return logs;
        }()
    }, {
        key: 'nextLogs',
        value: function () {
            var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4() {
                var response;
                return regeneratorRuntime.wrap(function _callee4$(_context4) {
                    while (1) {
                        switch (_context4.prev = _context4.next) {
                            case 0:
                                _context4.next = 2;
                                return this._auth();

                            case 2:
                                if (this._textAppendNextUrl) {
                                    _context4.next = 6;
                                    break;
                                }

                                _context4.next = 5;
                                return this.logs();

                            case 5:
                                return _context4.abrupt('return', '');

                            case 6:
                                _context4.next = 8;
                                return this._fetch(this._textAppendNextUrl, {
                                    method: 'GET',
                                    body: JSON.stringify({})
                                });

                            case 8:
                                response = _context4.sent;


                                this._textAppendNextUrl = response.headers['X-Text-Append-Next'];

                                _context4.next = 12;
                                return response.text();

                            case 12:
                                return _context4.abrupt('return', _context4.sent);

                            case 13:
                            case 'end':
                                return _context4.stop();
                        }
                    }
                }, _callee4, this);
            }));

            function nextLogs() {
                return _ref5.apply(this, arguments);
            }

            return nextLogs;
        }()
    }, {
        key: 'deploy',
        value: function () {
            var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(filePath) {
                var _ref7 = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
                    type = _ref7.type,
                    contextRoot = _ref7.contextRoot;

                var parse, id, formData, response;
                return regeneratorRuntime.wrap(function _callee5$(_context5) {
                    while (1) {
                        switch (_context5.prev = _context5.next) {
                            case 0:
                                _context5.next = 2;
                                return this._auth();

                            case 2:
                                parse = _path2.default.parse(filePath);

                                // type

                                type = type || parse.ext.substr(1); // without dot
                                if (['war', 'ear', 'rar', 'jar'].findIndex(function (t) {
                                    return t === type;
                                }) === -1) {
                                    type = 'other';
                                }

                                // context root
                                contextRoot = contextRoot || parse.name;

                                // id
                                id = _fs2.default.createReadStream(filePath);
                                formData = new _formData2.default();

                                formData.append('id', _fs2.default.createReadStream(filePath));
                                formData.append('type', type);
                                formData.append('contextroot', contextRoot);

                                _context5.next = 13;
                                return this._fetch(this._restUrl('/management/domain/applications/deploy.json'), {
                                    method: 'POST',
                                    headers: formData.getHeaders(),
                                    body: formData
                                });

                            case 13:
                                response = _context5.sent;


                                id.close();

                                _context5.t0 = _OperationResult2.default;
                                _context5.next = 18;
                                return response.json();

                            case 18:
                                _context5.t1 = _context5.sent;
                                return _context5.abrupt('return', new _context5.t0(_context5.t1));

                            case 20:
                            case 'end':
                                return _context5.stop();
                        }
                    }
                }, _callee5, this);
            }));

            function deploy(_x4) {
                return _ref6.apply(this, arguments);
            }

            return deploy;
        }()
    }]);

    return Glassfish;
}();

exports.default = Glassfish;
//# sourceMappingURL=Glassfish.js.map