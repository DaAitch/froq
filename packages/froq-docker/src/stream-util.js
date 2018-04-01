import JSONStream from 'JSONStream';
import debug from './debug';

export const drainStream = async res => {
    return new Promise((resolve, reject) => {
        const chunks = [];

        res.on('error', reject);
        res.on('data', chunk => {
            chunks.push(chunk);
        });
    
        res.on('end', () => {
            const result = Buffer.concat(chunks);
            resolve(result);
        });
    });
};

export const debugStream = async res => {
    return new Promise((resolve, reject) => {

        res.on('error', err => {
            debug('debug stream error: %o', err);
            reject(err);
        });
        res.on('data', chunk => {
            debug('debug stream: %s', chunk.toString());
        });
    
        res.on('end', () => {
            debug('debug stream end');
            resolve();
        });
    });
};


export const toJson = async res => {
    if (res.statusCode === 204) {
        return undefined;
    }
    
    const chunk = await drainStream(res);
    const string = chunk.toString();
    
    try {
        return JSON.parse(string);
    } catch (e) {
        debug('error reading json: %o, %s', e, string);
        throw e;
    }
};


export const jsonStream = async stream => {
    return new Promise(resolve => {
        const parser = JSONStream.parse();
        stream.pipe(parser);
        resolve(parser);
    });
};

export const progressStream = onProgress => async stream => {
    if (onProgress) {
        stream.on('data', onProgress);
    }

    return await new Promise((resolve, reject) => {
        stream.on('error', reject);
        stream.on('end', resolve);
    });
};

export const checkStatusCode = res => {

    if (res.statusCode >= 400 && res.statusCode <= 599) {
        debug('error status code %s "%s"', res.statusCode, res.statusMessage);
        
        const err = new Error(res);
        err.response = res;
        throw err;
    }

    return res;
};
