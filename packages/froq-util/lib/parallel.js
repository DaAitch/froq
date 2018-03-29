"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
    }

    return Promise.all(args.map(function (arg) {
        if (arg instanceof Function) {
            arg = arg();
        }

        if (!arg.then) {
            arg = Promise.resolve(arg);
        }

        return arg;
    }));
};