'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
const normalizeRepoTag = exports.normalizeRepoTag = repoTag => {
    if (typeof repoTag === 'string' && repoTag.indexOf('/') === -1) {
        repoTag = `library/${repoTag}`;
    }

    if (typeof repoTag === 'string' && repoTag.indexOf(':') === -1) {
        repoTag = `${repoTag}:latest`;
    }

    return repoTag;
};