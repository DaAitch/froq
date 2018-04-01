import {EventEmitter} from 'events';

import debug from './debug';

export default class DockerDuplexStream {

    /**
     * @param {net.Socket} socket
     * @param {Function} onEnd
     */
    constructor (socket, onEnd) {

        this._socket = socket;
        this._onEnd = onEnd;

        this._out = new EventEmitter();

        socket.on('data', chunk => {
            debug('received chunk size %s', chunk.length);
            this._out.emit('data', chunk);
        });
    }

    get out () {
        return this._out;
    }

    async write (chunk) {
        this._socket.cork();
        
        return await new Promise(resolve => {
            this._socket.write(chunk, resolve);
            this._socket.uncork();
        });
    }

    end () {
        debug('ending docker duplex stream');
        this._socket.end();

        if (this._onEnd) {
            this._onEnd();
        }
    }

}
