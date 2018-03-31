'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Route {

    constructor() {
        this.matcher = null;
        this.processer = null;
    }

    handle(req, resp, next) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const result = _this.matcher(req);

            if (result === false) {
                yield next();
                return;
            }

            const procResult = _this.processor(req, resp, result);
            yield Promise.resolve(procResult);
            (0, _debug2.default)('route processed');

            if (!resp.finished) {
                resp.end();
            }
        })();
    }

    get placeholderCount() {
        return this.matcher.placeholderCount;
    }
}
exports.default = Route;