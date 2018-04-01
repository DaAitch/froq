'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _events = require('events');

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class DockerDuplexStream {

    /**
     * @param {net.Socket} socket
     * @param {Function} onEnd
     */
    constructor(socket, onEnd) {

        this._socket = socket;
        this._onEnd = onEnd;

        this._out = new _events.EventEmitter();

        socket.on('data', chunk => {
            (0, _debug2.default)('received chunk size %s', chunk.length);
            this._out.emit('data', chunk);
        });
    }

    get out() {
        return this._out;
    }

    write(chunk) {
        var _this = this;

        return _asyncToGenerator(function* () {
            _this._socket.cork();

            return yield new Promise(function (resolve) {
                _this._socket.write(chunk, resolve);
                _this._socket.uncork();
            });
        })();
    }

    end() {
        (0, _debug2.default)('ending docker duplex stream');
        this._socket.end();

        if (this._onEnd) {
            this._onEnd();
        }
    }

}
exports.default = DockerDuplexStream;