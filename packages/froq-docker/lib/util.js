'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
var normalizeRepoTag = exports.normalizeRepoTag = function normalizeRepoTag(repoTag) {
    if (typeof repoTag === 'string' && repoTag.indexOf('/') === -1) {
        repoTag = 'library/' + repoTag;
    }

    if (typeof repoTag === 'string' && repoTag.indexOf(':') === -1) {
        repoTag = repoTag + ':latest';
    }

    return repoTag;
};