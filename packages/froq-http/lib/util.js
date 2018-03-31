'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPathMatcherFromTemplate = exports.pathMatch = exports.routeCompareFn = exports.defaultCompareFn = exports.resp = exports.reqBodyForType = exports.reqBufferToBody = exports.respBodyForType = exports.transformRestTemplate = exports.contentTypeLookupOrThrow = exports.isMime = exports.mimes = exports.resultByPlaceholders = exports.qSymbol = undefined;

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _froqUtil = require('froq-util');

var _mime = require('./mime');

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var qSymbol = exports.qSymbol = Symbol('Q');

var resultByPlaceholders = exports.resultByPlaceholders = function resultByPlaceholders(placeholders, result) {
    var x = [].concat(_toConsumableArray(result));

    for (var i = 0; i < result.length; ++i) {
        if (typeof placeholders[i] === 'string' && !(placeholders[i] in x)) {
            x[placeholders[i]] = result[i];
        }
    }

    return x;
};

var mimes = exports.mimes = {
    application: true,
    audio: true,
    example: true,
    image: true,
    message: true,
    model: true,
    multipart: true,
    text: true,
    video: true
};

var isMime = exports.isMime = function isMime(mime_) {
    if (!/^([^/]+)\//.test(mime_)) {
        return false;
    }

    return RegExp.$1 in mimes;
};

var contentTypeLookupOrThrow = exports.contentTypeLookupOrThrow = function contentTypeLookupOrThrow(type) {
    if (isMime(type)) {
        return type;
    }

    var contentType = _mimeTypes2.default.lookup(type);
    if (contentType !== false) {
        return contentType;
    }

    throw new TypeError('unknown type: ' + type);
};

var transformRestTemplate = exports.transformRestTemplate = function transformRestTemplate(strings, placeholders) {

    var method = void 0;

    if (strings.length >= 1 && /^(\s*(\S+)\s+)\//.test(strings[0])) {
        method = RegExp.$2;
        strings = [].concat(_toConsumableArray(strings));
        strings[0] = strings[0].substring(RegExp.$1.length);
    }

    return [method, strings, placeholders];
};

var respBodyForType = exports.respBodyForType = function respBodyForType(type, body) {

    if (Buffer.isBuffer(body)) {
        return body;
    }

    if ((0, _mime.isJsonType)(type)) {
        return JSON.stringify(body);
    }

    if ((0, _mime.isTextType)(type) && typeof body === 'string') {
        return body;
    }

    _froqUtil.log.warning('cannot transform body for type ' + type);
    if (typeof body === 'string') {
        return body;
    }

    // any string representation
    return '>>> ' + (typeof body === 'undefined' ? 'undefined' : _typeof(body)) + ': ' + JSON.stringify(body);
};

/**
 * @param {string} type
 * @param {Buffer} buffer
 */
var reqBufferToBody = exports.reqBufferToBody = function reqBufferToBody(type, buffer) {
    if ((0, _mime.isJsonType)(type)) {
        return JSON.parse(buffer.toString());
    }

    if ((0, _mime.isTextType)(type)) {
        return buffer.toString();
    }

    return buffer;
};

var reqBodyForType = exports.reqBodyForType = function reqBodyForType(req) {
    return new Promise(function (resolve, reject) {
        var chunks = [];
        req.on('data', function (chunk) {
            chunks.push(chunk);
        }).on('end', function () {
            var buffer = Buffer.concat(chunks);
            resolve(reqBufferToBody(req.headers['content-type'], buffer));
        }).on('error', reject);
    });
};

var resp = exports.resp = function resp(_ref) {
    var _ref2;

    var _ref$body = _ref.body,
        body = _ref$body === undefined ? null : _ref$body,
        _ref$type = _ref.type,
        type = _ref$type === undefined ? 'json' : _ref$type,
        _ref$status = _ref.status,
        status = _ref$status === undefined ? 200 : _ref$status;
    return _ref2 = {}, _defineProperty(_ref2, qSymbol, true), _defineProperty(_ref2, 'body', body), _defineProperty(_ref2, 'type', type), _defineProperty(_ref2, 'status', status), _ref2;
};

var defaultCompareFn = exports.defaultCompareFn = function defaultCompareFn(a, b) {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
};

var routeCompareFn = exports.routeCompareFn = function routeCompareFn(a, b) {
    return defaultCompareFn(a.getPlaceholderCount(), b.getPlaceholderCount());
};

/**
 * @param {string} path
 * @param {((path: string, index: number) => [number, number])[]} strings
 * @param {((placeholder: string) => boolean)[]} placeholders
 * @param {number} i
 * @param {any[]} result
 */
var pathMatch = exports.pathMatch = function pathMatch(path, strings, placeholders) {
    var i = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
    var result = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];


    if (i >= placeholders.length) {
        return result;
    }

    var found = path.length + 1;
    var length = -1;

    for (;;) {
        var _strings$i = strings[i](path, found - 1);

        var _strings$i2 = _slicedToArray(_strings$i, 2);

        found = _strings$i2[0];
        length = _strings$i2[1];

        if (found < 0) {
            return false;
        }

        var placeholder = path.substr(0, found);
        if (!placeholders[i](placeholder)) {
            continue;
        }

        var r = [].concat(_toConsumableArray(result));
        r[i] = placeholder;

        var match = pathMatch(path.substr(found + length), strings, placeholders, i + 1, r);
        if (match !== false) {
            return match;
        }
    }
};

var stringToFn = function stringToFn(find) {
    return function (string, position) {
        return [string.lastIndexOf(find, position), find.length];
    };
};
var placeholderToFn = function placeholderToFn(expression) {
    if (typeof expression === 'string') {
        return function () {
            return true;
        };
    } else if (expression instanceof RegExp) {
        return function (placeholder) {
            return expression.test(placeholder);
        };
    } else if (expression instanceof Function) {
        return expression;
    }

    throw new TypeError('unknown placeholder: ' + expression);
};

/**
 * @param {string[]} strings
 * @param {any[]} placeholders
 */
var createPathMatcherFromTemplate = exports.createPathMatcherFromTemplate = function createPathMatcherFromTemplate(strings) {
    for (var _len = arguments.length, placeholders = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        placeholders[_key - 1] = arguments[_key];
    }

    strings = strings.map(stringToFn);
    placeholders = [function (x) {
        return x === '';
    }].concat(_toConsumableArray(placeholders.map(placeholderToFn)));

    var fn = function fn(path) {
        var result = pathMatch(path, strings, placeholders);
        if (result === false) {
            return result;
        }

        return result.slice(1);
    };

    fn.placeholderCount = placeholders.length - 1; // without x => x === ''

    return fn;
};