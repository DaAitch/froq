'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.retry = exports.parallel = undefined;

var _parallel = require('./parallel');

var _parallel2 = _interopRequireDefault(_parallel);

var _retry = require('./retry');

var _retry2 = _interopRequireDefault(_retry);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.parallel = _parallel2.default;
exports.retry = _retry2.default;