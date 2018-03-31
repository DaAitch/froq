'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.createPathMatcherFromTemplate = exports.pathMatch = exports.routeCompareFn = exports.defaultCompareFn = exports.resp = exports.reqBodyForType = exports.reqBufferToBody = exports.respBodyForType = exports.transformRestTemplate = exports.contentTypeLookupOrThrow = exports.isMime = exports.mimes = exports.resultByPlaceholders = exports.qSymbol = undefined;

var _froqUtil = require('froq-util');

var _mime = require('./mime');

var _mimeTypes = require('mime-types');

var _mimeTypes2 = _interopRequireDefault(_mimeTypes);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const qSymbol = exports.qSymbol = Symbol('Q');

const resultByPlaceholders = exports.resultByPlaceholders = (placeholders, result) => {
    const x = [...result];

    for (let i = 0; i < result.length; ++i) {
        if (typeof placeholders[i] === 'string' && !(placeholders[i] in x)) {
            x[placeholders[i]] = result[i];
        }
    }

    return x;
};

const mimes = exports.mimes = {
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

const isMime = exports.isMime = mime_ => {
    if (!/^([^/]+)\//.test(mime_)) {
        return false;
    }

    return RegExp.$1 in mimes;
};

const contentTypeLookupOrThrow = exports.contentTypeLookupOrThrow = type => {
    if (isMime(type)) {
        return type;
    }

    const contentType = _mimeTypes2.default.lookup(type);
    if (contentType !== false) {
        return contentType;
    }

    throw new TypeError(`unknown type: ${type}`);
};

const transformRestTemplate = exports.transformRestTemplate = (strings, placeholders) => {

    let method;

    if (strings.length >= 1 && /^(\s*(\S+)\s+)\//.test(strings[0])) {
        method = RegExp.$2;
        strings = [...strings];
        strings[0] = strings[0].substring(RegExp.$1.length);
    }

    return [method, strings, placeholders];
};

const respBodyForType = exports.respBodyForType = (type, body) => {

    if (Buffer.isBuffer(body)) {
        return body;
    }

    if ((0, _mime.isJsonType)(type)) {
        return JSON.stringify(body);
    }

    if ((0, _mime.isTextType)(type) && typeof body === 'string') {
        return body;
    }

    _froqUtil.log.warning(`cannot transform body for type ${type}`);
    if (typeof body === 'string') {
        return body;
    }

    // any string representation
    return `>>> ${typeof body}: ${JSON.stringify(body)}`;
};

/**
 * @param {string} type
 * @param {Buffer} buffer
 */
const reqBufferToBody = exports.reqBufferToBody = (type, buffer) => {
    if ((0, _mime.isJsonType)(type)) {
        return JSON.parse(buffer.toString());
    }

    if ((0, _mime.isTextType)(type)) {
        return buffer.toString();
    }

    return buffer;
};

const reqBodyForType = exports.reqBodyForType = req => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => {
            chunks.push(chunk);
        }).on('end', () => {
            const buffer = Buffer.concat(chunks);
            resolve(reqBufferToBody(req.headers['content-type'], buffer));
        }).on('error', reject);
    });
};

const resp = exports.resp = ({ body = null, type = 'json', status = 200 }) => ({
    [qSymbol]: true,
    body,
    type,
    status
});

const defaultCompareFn = exports.defaultCompareFn = (a, b) => {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
};

const routeCompareFn = exports.routeCompareFn = (a, b) => {
    return defaultCompareFn(a.getPlaceholderCount(), b.getPlaceholderCount());
};

/**
 * @param {string} path
 * @param {((path: string, index: number) => [number, number])[]} strings
 * @param {((placeholder: string) => boolean)[]} placeholders
 * @param {number} i
 * @param {any[]} result
 */
const pathMatch = exports.pathMatch = (path, strings, placeholders, i = 0, result = []) => {

    if (i >= placeholders.length) {
        return result;
    }

    let found = path.length + 1;
    let length = -1;

    for (;;) {
        [found, length] = strings[i](path, found - 1);
        if (found < 0) {
            return false;
        }

        const placeholder = path.substr(0, found);
        if (!placeholders[i](placeholder)) {
            continue;
        }

        const r = [...result];
        r[i] = placeholder;

        const match = pathMatch(path.substr(found + length), strings, placeholders, i + 1, r);
        if (match !== false) {
            return match;
        }
    }
};

const stringToFn = find => (string, position) => [string.lastIndexOf(find, position), find.length];
const placeholderToFn = expression => {
    if (typeof expression === 'string') {
        return () => true;
    } else if (expression instanceof RegExp) {
        return placeholder => expression.test(placeholder);
    } else if (expression instanceof Function) {
        return expression;
    }

    throw new TypeError(`unknown placeholder: ${expression}`);
};

/**
 * @param {string[]} strings
 * @param {any[]} placeholders
 */
const createPathMatcherFromTemplate = exports.createPathMatcherFromTemplate = (strings, ...placeholders) => {

    strings = strings.map(stringToFn);
    placeholders = [x => x === '', ...placeholders.map(placeholderToFn)];

    const fn = path => {
        const result = pathMatch(path, strings, placeholders);
        if (result === false) {
            return result;
        }

        return result.slice(1);
    };

    fn.placeholderCount = placeholders.length - 1; // without x => x === ''

    return fn;
};