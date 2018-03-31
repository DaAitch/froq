'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

const nextTick = (() => {
    var _ref = _asyncToGenerator(function* () {
        return yield new Promise(function (resolve, reject) {
            return process.nextTick(resolve);
        });
    });

    return function nextTick() {
        return _ref.apply(this, arguments);
    };
})();
const timeout = (() => {
    var _ref2 = _asyncToGenerator(function* (millis) {
        return yield new Promise(function (resolve, reject) {
            return setTimeout(resolve, millis);
        });
    });

    return function timeout(_x) {
        return _ref2.apply(this, arguments);
    };
})();

exports.default = (() => {
    var _ref3 = _asyncToGenerator(function* ({ try: try_, total = 10000, defer = undefined, max = 100 }) {

        let i = 0;

        const now = Date.now();
        let exceptions = [];

        while (now + total > Date.now() && i < max) {
            try {
                ++i;
                return yield try_();
            } catch (e) {
                (0, _debug2.default)('try %d failed', i);
            }

            if (defer !== undefined) {
                (0, _debug2.default)('wait %d ms', defer);
                yield timeout(defer);
            } else {
                yield nextTick(); // try_ might be sync, thus we need async
            }
        }

        const err = new Error('retry failed ' + i + ' times');
        err.exceptions = exceptions;
        throw err;
    });

    return function (_x2) {
        return _ref3.apply(this, arguments);
    };
})();