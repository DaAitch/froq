import Exec from './Exec';

export default class Container {
    
    /**
     * @param {Docker} docker
     * @param {string} id
     */
    constructor (docker, id) {
        this._docker = docker;
        this._id = id;
    }

    get id () {
        return this._id;
    }

    async start (detachKeys = undefined) {
        return await this._docker.startContainer({
            id: this._id,
            detachKeys
        });
    }

    async stop (t = undefined) {
        return await this._docker.stopContainer({
            id: this._id,
            t
        });
    }

    async wait (condition = undefined) {
        return await this._docker.waitForContainer({
            id: this._id,
            condition
        });
    }

    async remove ({force = undefined, link = undefined, v = undefined} = {}) {
        return await this._docker.removeContainer({
            id: this._id,
            force,
            link,
            v
        });
    }

    async inspect (size = undefined) {
        return await this._docker.inspectContainer({
            id: this._id,
            size
        });
    }

    async attach (streamCb) {
        return await this._docker.attachContainer({
            id: this._id
        }, streamCb);
    }

    async createExec (data) {
        const result = await this._docker.createContainerExec({
            id: this._id,
            data
        });

        return new Exec(this._docker, result && result.Id);
    }
    
}
