import zlib from 'zlib';
import fs from 'fs';
import util from 'util';
import os from 'os';
import path from 'path';

import {test} from 'ava';
import tar from 'tar-stream';
import rimraf_ from 'rimraf';

import BuildStream from '../src/BuildStream';

const mkdtemp = util.promisify(fs.mkdtemp);
const writeFile = util.promisify(fs.writeFile);
const mkdir = util.promisify(fs.mkdir);
const rimraf = util.promisify(rimraf_);

const tmpdirPrefix = path.join(os.tmpdir(), 'froq-docker-util_');


const readEntry = cb => (header, stream, next) => {
    let string = '';

    stream.on('data', chunk => {
        string += chunk.toString();
    });

    stream.on('end', () => {
        cb(header.name, string);
        next();
    });

    stream.resume();
};

test.beforeEach(async t => {
    t.context.tmpdir = await mkdtemp(tmpdirPrefix);
});

test.afterEach(async t => {
    await rimraf(t.context.tmpdir);
});

test('should stream raw', async t => {
    const bs = new BuildStream(false);
    t.is(bs.contentType, 'application/tar');

    const extract = tar.extract();
    bs.stream.pipe(extract);

    const files = {};

    extract.on('entry', readEntry((name, content) => {
        files[name] = content;
    }));

    const build = async () => {
        await bs.addFileAsBuffer('buffer.txt', 'buffer');
        await bs.addFileAsStream('stream.txt', 6, stream => {
            stream.write('stream');
            stream.end();
        });

        bs.end();
    };

    await Promise.all([
        new Promise((resolve, reject) => {
            extract.on('error', reject);
            extract.on('finish', resolve);
        }),
        build()
    ]);
    
    t.deepEqual(files, {
        'buffer.txt': 'buffer',
        'stream.txt': 'stream'
    });
});

test('should stream gzipped', async t => {
    const bs = new BuildStream(true);
    t.is(bs.contentType, 'application/tar+gzip');

    const extract = tar.extract();
    bs.stream.pipe(zlib.createGunzip()).pipe(extract);

    const files = {};

    extract.on('entry', (header, stream, next) => {
        let string = '';

        stream.on('data', chunk => {
            string += chunk.toString();
        });

        stream.on('end', () => {
            files[header.name] = string;
            next();
        });

        stream.resume();
    });

    const build = async () => {
        await bs.addFileAsBuffer('buffer2.txt', 'buffer2');
        await bs.addFileAsStream('stream2.txt', 7, stream => {
            stream.write('stream2');
            stream.end();
        });

        bs.end();
    };

    await Promise.all([
        new Promise((resolve, reject) => {
            extract.on('error', reject);
            extract.on('finish', resolve);
        }),
        build()
    ]);
    
    t.deepEqual(files, {
        'buffer2.txt': 'buffer2',
        'stream2.txt': 'stream2'
    });
});

test('should add file', async t => {
    const filePath = path.join(t.context.tmpdir, 'file.txt');
    await writeFile(filePath, 'content of file.txt');

    const bs = new BuildStream(false);

    const build = async () => {
        await bs.addFileFromFile(filePath);
        bs.end();
    };

    const files = {};
    const extract = tar.extract();

    extract.on('entry', readEntry((name, content) => {
        files[name] = content;
    }));


    await Promise.all([
        new Promise((resolve, reject) => {
            extract.on('error', reject);
            extract.on('finish', resolve);

            bs.stream.pipe(extract);
        }),
        build()
    ]);

    
    t.deepEqual(files, {
        'file.txt': 'content of file.txt'
    });
});

test('should add folder', async t => {
    const file1Path = path.join(t.context.tmpdir, 'file1.txt');
    const srcFolder = path.join(t.context.tmpdir, 'src');
    const file2Path = path.join(srcFolder, 'file2.txt');

    await Promise.all([
        writeFile(file1Path, 'content of file1.txt'),
        (async () => {
            await mkdir(srcFolder);
            await writeFile(file2Path, 'content of file2.txt');
        })()
    ]);

    const bs = new BuildStream(false);

    const build = async () => {
        await bs.addFileFromFile(t.context.tmpdir);
        bs.end();
    };

    const files = {};
    const extract = tar.extract();

    extract.on('entry', readEntry((name, content) => {
        files[name] = content;
    }));


    await Promise.all([
        new Promise((resolve, reject) => {
            extract.on('error', reject);
            extract.on('finish', resolve);

            bs.stream.pipe(extract);
        }),
        build()
    ]);

    
    t.deepEqual(files, {
        'file1.txt': 'content of file1.txt',
        'src/file2.txt': 'content of file2.txt'
    });
});

test('should throw if adding while writing', async t => {
    const bs = new BuildStream();

    bs.addFileAsStream('file1.txt', 4, stream => {
        process.nextTick(() => {
            stream.write('test');
            stream.end();
        });
    });

    await t.throws(bs.addFileAsBuffer('file2.txt', 'should fail'));
});
