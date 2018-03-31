"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

exports.default = (...args) => {
    return Promise.all(args.map(arg => {
        if (arg instanceof Function) {
            arg = arg();
        }

        if (!arg.then) {
            arg = Promise.resolve(arg);
        }

        return arg;
    }));
};