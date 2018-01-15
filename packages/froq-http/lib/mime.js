"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

var JSON_TYPE = /^application\/json/i;
var TEXT_TYPE = /^text\//i;

var isJsonType = exports.isJsonType = function isJsonType(type) {
    return JSON_TYPE.test(type);
};

var isTextType = exports.isTextType = function isTextType(type) {
    return TEXT_TYPE.test(type);
};
//# sourceMappingURL=mime.js.map