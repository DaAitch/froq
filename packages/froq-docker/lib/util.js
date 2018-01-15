'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.normalizeRepoTag = undefined;

var _dockerode = require('dockerode');

var _dockerode2 = _interopRequireDefault(_dockerode);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var normalizeRepoTag = exports.normalizeRepoTag = function normalizeRepoTag(repoTag) {
    if (typeof repoTag === 'string' && repoTag.indexOf('/') === -1) {
        repoTag = 'library/' + repoTag;
    }

    if (typeof repoTag === 'string' && repoTag.indexOf(':') === -1) {
        repoTag = repoTag + ':latest';
    }

    return repoTag;
};
//# sourceMappingURL=util.js.map