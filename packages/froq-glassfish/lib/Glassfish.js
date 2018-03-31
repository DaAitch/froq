'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nodeFetch = require('node-fetch');

var _nodeFetch2 = _interopRequireDefault(_nodeFetch);

var _formData = require('form-data');

var _formData2 = _interopRequireDefault(_formData);

var _froqUtil = require('froq-util');

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _OperationResult = require('./OperationResult');

var _OperationResult2 = _interopRequireDefault(_OperationResult);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Glassfish {
    constructor(url, user, password) {
        this._url = url;
        this._user = user;
        this._password = password;
        this._gftoken = undefined;
        this._textAppendNextUrl = undefined;
    }

    _restUrl(path_) {
        return this._url + path_;
    }

    _fetch(url, opts) {
        var _this = this;

        return _asyncToGenerator(function* () {

            opts = Object.assign({}, opts);
            opts.headers = Object.assign({
                'x-requested-by': 'GlassFish REST HTML interface', // important -.-
                'content-type': 'application/json'
            }, _this._gftoken ? {
                cookie: `gfresttoken=${_this._gftoken}`
            } : {
                authorization: `Basic ${new Buffer(`${_this._user}:${_this._password}`).toString('base64')}`
            }, opts.headers || {});

            (0, _debug2.default)('fetch url %s with opts %o', url, opts);
            return yield (0, _froqUtil.retry)({ try: function () {
                    return (0, _nodeFetch2.default)(url, opts);
                }, defer: 500 });
        })();
    }

    _auth() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            if (_this2._gftoken) {
                return;
            }

            const response = yield _this2._fetch(_this2._restUrl('/management/sessions.json'), {
                method: 'POST',
                body: JSON.stringify({})
            });

            const json = yield response.json();
            const result = new _OperationResult2.default(json);

            if (!result.isSuccess()) {
                throw result.asError();
            }

            const gftoken = json.extraProperties.token;
            (0, _debug2.default)('got token %s', gftoken);

            _this2._gftoken = gftoken;
        })();
    }

    logs() {
        var _this3 = this;

        return _asyncToGenerator(function* () {
            yield _this3._auth();

            const response = yield _this3._fetch(_this3._restUrl('/management/domain/view-log'), {
                method: 'GET',
                body: JSON.stringify({})
            });

            _this3._textAppendNextUrl = response.headers['X-Text-Append-Next'];

            return yield response.text();
        })();
    }

    nextLogs() {
        var _this4 = this;

        return _asyncToGenerator(function* () {
            yield _this4._auth();

            if (!_this4._textAppendNextUrl) {
                yield _this4.logs();
                return '';
            }

            const response = yield _this4._fetch(_this4._textAppendNextUrl, {
                method: 'GET',
                body: JSON.stringify({})
            });

            _this4._textAppendNextUrl = response.headers['X-Text-Append-Next'];

            return yield response.text();
        })();
    }

    deploy(filePath, { type, contextRoot } = {}) {
        var _this5 = this;

        return _asyncToGenerator(function* () {
            yield _this5._auth();

            const parse = _path2.default.parse(filePath);

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
            const id = _fs2.default.createReadStream(filePath);

            const formData = new _formData2.default();
            formData.append('id', _fs2.default.createReadStream(filePath));
            formData.append('type', type);
            formData.append('contextroot', contextRoot);

            const response = yield _this5._fetch(_this5._restUrl('/management/domain/applications/deploy.json'), {
                method: 'POST',
                headers: formData.getHeaders(),
                body: formData
            });

            id.close();

            return new _OperationResult2.default((yield response.json()));
        })();
    }
}
exports.default = Glassfish;