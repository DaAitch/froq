'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _froqDocker = require('froq-docker');

var _froqDocker2 = _interopRequireDefault(_froqDocker);

var _froqGlassfish = require('froq-glassfish');

var _froqGlassfish2 = _interopRequireDefault(_froqGlassfish);

var _froqHttp = require('froq-http');

var _froqHttp2 = _interopRequireDefault(_froqHttp);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    docker: _froqDocker2.default,
    glassfish: _froqGlassfish2.default,
    http: _froqHttp2.default
};
//# sourceMappingURL=index.js.map