import zlib from 'zlib';
import path from 'path';
import fs from 'fs';
import util from 'util';
import tar from 'tar-stream';
import debug_ from 'debug';

const debug = debug_('froq-docker-util-buildstream');

const stat = util.promisify(fs.stat);
const readdir = util.promisify(fs.readdir);
const readlink = util.promisify(fs.readlink);

export default class BuildStream {
    constructor (gzip = true) {
        this._pack = tar.pack();
        this._gzip = gzip;

        this._writing = false;

        this._stream = this._pack;
        if (gzip) {
            this._stream = this._pack.pipe(zlib.createGzip());
        }
    }

    get stream () {
        return this._stream;
    }

    get contentType () {
        return this._gzip ? 'application/tar+gzip' : 'application/tar';
    }

    _setWriting () {
        if (this._writing) {
            throw new Error('already writing');
        }

        this._writing = true;
    }

    _resetWriting () {
        this._writing = false;
    }

    async addFileAsBuffer (name, stringOrBuffer) {
        this._setWriting();

        debug('add buffer at `%s`', name);

        return new Promise((resolve, reject) => {
            this._pack.entry({name}, stringOrBuffer, err => {
                this._resetWriting();

                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });
        });
    }

    async addFileAsStream (name, size, streamCb) {
        this._setWriting();

        debug('add stream at `%s` with size %d', name, size);

        return new Promise((resolve, reject) => {
            const stream = this._pack.entry({name, size}, err => {
                this._resetWriting();
                
                if (err) {
                    reject(err);
                    return;
                }

                resolve();
            });

            if (debug.enabled) {
                stream.on('finish', () => {
                    debug('streaming `%s` finished', name);
                });
            }
    
            streamCb(stream);
        });
    }

    async addFileFromFile (filePath, name = '', followSymlinks = false) {
        debug('add file `%s` from `%s`: %o', name, filePath, {followSymlinks});

        await this._addFileFromFile(filePath, name, followSymlinks, new Set(), true);
    }

    /**
     * @param {string} filePath
     * @param {string} name
     * @param {boolean} followSymlinks
     * @param {Set} fileSet is mutable, parallel adding files not possible
     * @param {boolean} isRoot
     */
    async _addFileFromFile (filePath, name, followSymlinks, fileSet, isRoot) {
        const stats = await stat(filePath);
        
        if (stats.isSymbolicLink()) {

            if (!followSymlinks) {
                debug('will not add symlink folder `%s` from `%s`', name, filePath);
                return;
            }

            const linkTarget = await readlink(filePath);

            if (fileSet.has(linkTarget)) {
                debug('symlink folder %s from `%s` -> `%s` already added', name, filePath, linkTarget);
                return;
            }

            fileSet.add(linkTarget);
            debug('add symlink folder `%s` from `%s` -> `%s`', name, filePath, linkTarget);
            await this._addFileFromFile(linkTarget, name, followSymlinks, fileSet, false);
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

            const targetBasename = path.basename(filePath);

            const files = await readdir(filePath);
            for (const file of files) {
                const directoryFilePath = path.join(filePath, file);

                let directoryFileName = name;
                if (!isRoot) {
                    if (name) {
                        directoryFileName = path.join(name, targetBasename);
                    } else {
                        directoryFileName = targetBasename;
                    }
                }
                
                await this._addFileFromFile(directoryFilePath, directoryFileName, followSymlinks, fileSet, false);
            }
            
            fileSet.delete(filePath);

            return;
        }

        if (stats.isFile()) {

            const targetBasename = path.basename(filePath);
            const targetName = name ? path.join(name, targetBasename) : targetBasename;

            if (fileSet.has(filePath)) {
                debug('file `%s` from `%s` already added', targetName, filePath);
                return;
            }

            await this.addFileAsStream(targetName, stats.size, stream => {
                fs.createReadStream(filePath).pipe(stream);
            });

            return;
        }

        debug('unknown file type at `%s`, not added', filePath);
    }

    end () {
        this._pack.finalize();
    }
}
