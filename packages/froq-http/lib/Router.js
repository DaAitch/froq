"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Router = function () {
    function Router() {
        _classCallCheck(this, Router);

        this.routes = [];
    }

    _createClass(Router, [{
        key: "handle",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(req, resp, next) {
                var _this = this;

                var lastRoute = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : undefined;
                var route;
                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                route = this.routes[lastRoute === undefined ? 0 : this.routes.findIndex(function (route_) {
                                    return route_ === lastRoute;
                                }) + 1];

                                if (route) {
                                    _context2.next = 5;
                                    break;
                                }

                                _context2.next = 4;
                                return next();

                            case 4:
                                return _context2.abrupt("return");

                            case 5:
                                _context2.next = 7;
                                return route.handle(req, resp, _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
                                    return regeneratorRuntime.wrap(function _callee$(_context) {
                                        while (1) {
                                            switch (_context.prev = _context.next) {
                                                case 0:
                                                    _context.next = 2;
                                                    return _this.handle(req, resp, next, route);

                                                case 2:
                                                case "end":
                                                    return _context.stop();
                                            }
                                        }
                                    }, _callee, _this);
                                })));

                            case 7:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function handle(_x, _x2, _x3) {
                return _ref.apply(this, arguments);
            }

            return handle;
        }()
    }, {
        key: "add",
        value: function add(route) {
            this.routes.push(route);
        }
    }]);

    return Router;
}();

exports.default = Router;