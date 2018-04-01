export default class Exec {

    constructor (docker, id) {
        this._docker = docker;
        this._id = id;
    }

    async start (data, streamCb) {
        return await this._docker.startContainerExec({
            id: this._id,
            data
        }, streamCb);
    }
}
