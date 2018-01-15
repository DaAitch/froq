'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _Docker = require('./Docker');

var _Docker2 = _interopRequireDefault(_Docker);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = {
    fromSocket: function fromSocket(socketFile) {
        return _Docker2.default.fromSocket(socketFile);
    }
};
//# sourceMappingURL=index.js.map