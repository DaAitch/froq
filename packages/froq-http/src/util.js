import {log} from 'froq-util';
import {isJsonType, isTextType} from './mime';

import mime from 'mime-types';


export const qSymbol = Symbol('Q');

export const resultByPlaceholders = (placeholders, result) => {
    const x = [...result];

    for (let i = 0; i < result.length; ++i) {
        if (typeof placeholders[i] === 'string' && !(placeholders[i] in x)) {
            x[placeholders[i]] = result[i];
        }
    }

    return x;
};


export const mimes = {
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

export const isMime = mime_ => {
    if (!/^([^/]+)\//.test(mime_)) {
        return false;
    }

    return RegExp.$1 in mimes;
};

export const contentTypeLookupOrThrow = type => {
    if (isMime(type)) {
        return type;
    }

    const contentType = mime.lookup(type);
    if (contentType !== false) {
        return contentType;
    }

    throw new TypeError(`unknown type: ${type}`);
};

export const transformRestTemplate = (strings, placeholders) => {

    let method;

    if (strings.length >= 1 && /^(\s*(\S+)\s+)\//.test(strings[0])) {
        method = RegExp.$2;
        strings = [...strings];
        strings[0] = strings[0].substring(RegExp.$1.length);
    }

    return [
        method,
        strings,
        placeholders
    ];
};

export const respBodyForType = (type, body) => {

    if (Buffer.isBuffer(body)) {
        return body;
    }

    if (isJsonType(type)) {
        return JSON.stringify(body);
    }

    if (isTextType(type) && typeof body === 'string') {
        return body;
    }

    log.warning(`cannot transform body for type ${type}`);
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
export const reqBufferToBody = (type, buffer) => {
    if (isJsonType(type)) {
        return JSON.parse(buffer.toString());
    }

    if (isTextType(type)) {
        return buffer.toString();
    }

    return buffer;
};

export const reqBodyForType = req => {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req
            .on('data', chunk => {
                chunks.push(chunk);
            })
            .on('end', () => {
                const buffer = Buffer.concat(chunks);
                resolve(reqBufferToBody(req.headers['content-type'], buffer));
            })
            .on('error', reject)
        ;
    });
};

export const resp = ({body = null, type = 'json', status = 200}) => ({
    [qSymbol]: true,
    body,
    type,
    status
});


export const defaultCompareFn = (a, b) => {
    if (a < b) {
        return -1;
    }

    if (a > b) {
        return 1;
    }

    return 0;
};

export const routeCompareFn = (a, b) => {
    return defaultCompareFn(a.getPlaceholderCount(), b.getPlaceholderCount());
};

/**
 * @param {string} path
 * @param {((path: string, index: number) => [number, number])[]} strings
 * @param {((placeholder: string) => boolean)[]} placeholders
 * @param {number} i
 * @param {any[]} result
 */
export const pathMatch = (path, strings, placeholders, i = 0, result = []) => {
    
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
export const createPathMatcherFromTemplate = (strings, ...placeholders) => {

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
