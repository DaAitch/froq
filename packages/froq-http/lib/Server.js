'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Router = require('./Router');

var _Router2 = _interopRequireDefault(_Router);

var _Route = require('./Route');

var _Route2 = _interopRequireDefault(_Route);

var _Connection = require('./Connection');

var _Connection2 = _interopRequireDefault(_Connection);

var _Rest = require('./Rest');

var _Rest2 = _interopRequireDefault(_Rest);

var _debug = require('./debug');

var _debug2 = _interopRequireDefault(_debug);

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Server {
    constructor(name, port) {
        this._name = name;
        this._port = port;

        this._connection = new _Connection2.default(name);
        this._router = new _Router2.default();

        this._connection.setHandler((req, resp, next) => this._router.handle(req, resp, next));
    }

    start() {
        var _this = this;

        return _asyncToGenerator(function* () {
            yield _this._connection.start(_this._port);
        })();
    }

    stop() {
        var _this2 = this;

        return _asyncToGenerator(function* () {
            yield _this2._connection.stop();
        })();
    }

    get name() {
        return this._name;
    }

    get address() {
        const address = this._connection.address;
        switch (address.family) {
            case 'IPv4':
                {
                    return `${this._connection.address.address}:${this._connection.address.port}`;
                }
            case 'IPv6':
                {
                    return `[${this._connection.address.address}]:${this._connection.address.port}`;
                }
            default:
                {
                    return undefined;
                }
        }
    }

    url(path = '') {
        return `http://${this.address}${path}`;
    }

    type(type) {
        this._type = (0, _util.contentTypeLookupOrThrow)(type);
        return this;
    }

    rest(strings, ...placeholders) {

        let method;
        [method, strings, placeholders] = (0, _util.transformRestTemplate)(strings, placeholders);

        const route = new _Route2.default();
        const matcher = (0, _util.createPathMatcherFromTemplate)(strings, ...placeholders);

        route.matcher = req => {
            if (method && req.method !== method) {
                return false;
            }

            const result = matcher(req.url);
            (0, _debug2.default)('%s: %s %s %s', this._name, req.url, result !== false ? 'matches' : 'not matches', strings.join('...'));

            return result;
        };

        route.processor = () => {
            throw new Error(`processor missing for ${strings.join('...')}.`);
        };

        return new _Rest2.default({ route, router: this._router, placeholders, server: this });
    }
}
exports.default = Server;