import {EventEmitter} from 'events';

import debug from './debug';

export default class DockerRawStream {

    /**
     * @param {net.Socket} socket
     * @param {Function} onEnd
     */
    constructor (socket, onEnd) {

        this._socket = socket;
        this._onEnd = onEnd;

        this._std = [
            null,
            new EventEmitter(),
            new EventEmitter()
        ];

        this._chunk = null;

        socket.on('data', this._onData);
    }

    get stdout () {
        return this._std[1];
    }

    get stderr () {
        return this._std[2];
    }

    _onData = chunk => {

        debug('received chunk size %s: %s', chunk.length, chunk.toString());

        if (!this._chunk) {
            this._chunk = chunk;
        } else {
            this._chunk = Buffer.concat([this._chunk, chunk], this._chunk.length + chunk.length);
        }

        this._reduceChunk();
    };
    
    _reduceChunk () {
        // too small for reading header
        if (this._chunk.length < 8) {
            return;
        }

        const size = this._chunk.readUInt32BE(4);

        // too small for reading frame
        if (this._chunk.length < 8 + size) {
            return;
        }

        const stdId = this._chunk.readUInt8();
        const data = this._chunk.slice(8, 8 + size);

        const std = this._std[stdId];
        if (!std) {
            debug('unknown std %d', stdId);
            return;
        }

        this._chunk = this._chunk.slice(8 + size);
        std.emit('data', data);

        process.nextTick(() => this._reduceChunk());
    }

    async write (chunk) {

        const size = Buffer.byteLength(chunk);

        debug('write chunk size %d', size);

        const writeBuffer = new Buffer(8);
        writeBuffer.writeUInt32BE(0, 0);
        writeBuffer.writeUInt32BE(size, 4);

        this._socket.cork();

        // write header
        this._socket.write(writeBuffer);

        return await new Promise(resolve => {
            // write frame
            this._socket.write(chunk, resolve);

            process.nextTick(() => {
                this._socket.uncork();
            });
        });
    }

    end () {
        debug('ending docker raw stream');
        this._socket.end();

        if (this._onEnd) {
            this._onEnd();
        }
    }

}
