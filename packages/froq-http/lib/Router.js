"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

class Router {
    constructor() {
        this.routes = [];
    }

    handle(req, resp, next, lastRoute = undefined) {
        var _this = this;

        return _asyncToGenerator(function* () {
            const route = _this.routes[lastRoute === undefined ? 0 : _this.routes.findIndex(function (route_) {
                return route_ === lastRoute;
            }) + 1];

            if (!route) {
                yield next();
                return;
            }

            yield route.handle(req, resp, _asyncToGenerator(function* () {
                yield _this.handle(req, resp, next, route);
            }));
        })();
    }

    add(route) {
        this.routes.push(route);
    }
}
exports.default = Router;