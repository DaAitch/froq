import Docker from './Docker';

export default class Image {

    /**
     * @param {Docker} docker
     */
    constructor (docker, repoTag) {
        this._docker = docker;
        this._repoTag = repoTag;
    }

    createContainer () {
        return this._docker.createContainer(this._repoTag);
    }
}
