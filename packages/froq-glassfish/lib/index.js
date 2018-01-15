'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _Glassfish = require('./Glassfish');

var _Glassfish2 = _interopRequireDefault(_Glassfish);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (url, user, password) {
  return new _Glassfish2.default(url, user, password);
};
//# sourceMappingURL=index.js.map