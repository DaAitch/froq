"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Image = function () {

    /**
     * @param {Docker} docker
     */
    function Image(docker, name) {
        _classCallCheck(this, Image);

        this._docker = docker;
        this._name = name;
    }

    _createClass(Image, [{
        key: "createContainer",
        value: function () {
            var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(_ref2) {
                var _ref2$data = _ref2.data,
                    data = _ref2$data === undefined ? {} : _ref2$data,
                    _ref2$name = _ref2.name,
                    name = _ref2$name === undefined ? undefined : _ref2$name;
                return regeneratorRuntime.wrap(function _callee$(_context) {
                    while (1) {
                        switch (_context.prev = _context.next) {
                            case 0:
                                _context.next = 2;
                                return this._docker.createContainer({
                                    data: _extends({}, data, {
                                        Image: this._name
                                    }),
                                    name: name
                                });

                            case 2:
                                return _context.abrupt("return", _context.sent);

                            case 3:
                            case "end":
                                return _context.stop();
                        }
                    }
                }, _callee, this);
            }));

            function createContainer(_x) {
                return _ref.apply(this, arguments);
            }

            return createContainer;
        }()
    }, {
        key: "remove",
        value: function () {
            var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2() {
                var _ref4 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
                    _ref4$force = _ref4.force,
                    force = _ref4$force === undefined ? undefined : _ref4$force,
                    _ref4$noprune = _ref4.noprune,
                    noprune = _ref4$noprune === undefined ? undefined : _ref4$noprune;

                return regeneratorRuntime.wrap(function _callee2$(_context2) {
                    while (1) {
                        switch (_context2.prev = _context2.next) {
                            case 0:
                                _context2.next = 2;
                                return this._docker.removeImage({ name: this._name, force: force, noprune: noprune });

                            case 2:
                                return _context2.abrupt("return", _context2.sent);

                            case 3:
                            case "end":
                                return _context2.stop();
                        }
                    }
                }, _callee2, this);
            }));

            function remove() {
                return _ref3.apply(this, arguments);
            }

            return remove;
        }()
    }, {
        key: "name",
        get: function get() {
            return this._name;
        }
    }]);

    return Image;
}();

exports.default = Image;