'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _events = require('events');

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class DockerRawStream {

    /**
     * @param {net.Socket} socket
     * @param {Function} onEnd
     */
    constructor(socket, onEnd) {
        this._onData = chunk => {

            (0, _debug2.default)('received chunk size %s: %s', chunk.length, chunk.toString());

            if (!this._chunk) {
                this._chunk = chunk;
            } else {
                this._chunk = Buffer.concat([this._chunk, chunk], this._chunk.length + chunk.length);
            }

            this._reduceChunk();
        };

        this._socket = socket;
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

    write(chunk) {
        var _this = this;

        return _asyncToGenerator(function* () {

            const size = Buffer.byteLength(chunk);

            (0, _debug2.default)('write chunk size %d', size);

            const writeBuffer = new Buffer(8);
            writeBuffer.writeUInt32BE(0, 0);
            writeBuffer.writeUInt32BE(size, 4);

            _this._socket.cork();

            // write header
            _this._socket.write(writeBuffer);

            return yield new Promise(function (resolve) {
                // write frame
                _this._socket.write(chunk, resolve);

                process.nextTick(function () {
                    _this._socket.uncork();
                });
            });
        })();
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