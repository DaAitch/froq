"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

const JSON_TYPE = /^application\/json/i;
const TEXT_TYPE = /^text\//i;

const isJsonType = exports.isJsonType = type => {
    return JSON_TYPE.test(type);
};

const isTextType = exports.isTextType = type => {
    return TEXT_TYPE.test(type);
};