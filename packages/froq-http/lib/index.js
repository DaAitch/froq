'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Server = require('./Server');

var _Server2 = _interopRequireDefault(_Server);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var http = function () {
    var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'http-server';
        var port = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;
        var server;
        return regeneratorRuntime.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        server = new _Server2.default(name, port);
                        _context.next = 3;
                        return server.start();

                    case 3:
                        return _context.abrupt('return', server);

                    case 4:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, undefined);
    }));

    return function http() {
        return _ref.apply(this, arguments);
    };
}();

http.resp = _util.resp;

exports.default = http;
//# sourceMappingURL=index.js.map