'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _http = require('http');

var _http2 = _interopRequireDefault(_http);

var _net = require('net');

var _net2 = _interopRequireDefault(_net);

var _events = require('events');

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class DockerRawStream {

    /**
     * @param {http.ServerResponse} res
     * @param {net.Socket} socket
     * @param {string} upgradeHeader
     */
    constructor(res, socket, upgradeHeader, onEnd) {
        this._onData = chunk => {

            (0, _debug2.default)('received chunk size %s', chunk.length);

            if (!this._chunk) {
                this._chunk = chunk;
            } else {
                this._chunk = Buffer.concat([this._chunk, chunk], this._chunk.length + chunk.length);
            }

            this._reduceChunk();
        };

        this._res = res;
        this._socket = socket;
        this._upgradeHeader = upgradeHeader;
        this._onEnd = onEnd;

        this._std = [null, new _events.EventEmitter(), new _events.EventEmitter()];

        this._chunk = null;

        socket.on('data', this._onData);
    }

    get stdout() {
        return this._std[1];
    }

    get stderr() {
        return this._std[2];
    }

    _reduceChunk() {
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
            (0, _debug2.default)('unknown std %d', stdId);
            return;
        }

        this._chunk = this._chunk.slice(8 + size);
        std.emit('data', data);

        process.nextTick(() => this._reduceChunk());
    }

    end() {
        (0, _debug2.default)('ending docker raw stream');
        this._socket.end();

        if (this._onEnd) {
            this._onEnd();
        }
    }

}
exports.default = DockerRawStream;