
export default class Image {

    /**
     * @param {Docker} docker
     */
    constructor (docker, name) {
        this._docker = docker;
        this._name = name;
    }

    get name () {
        return this._name;
    }

    async createContainer ({data = {}, name = undefined}) {
        return await this._docker.createContainer({
            data: {
                ...data,
                Image: this._name
            },
            name
        });
    }

    async remove ({force = undefined, noprune = undefined} = {}) {
        return await this._docker.removeImage({name: this._name, force, noprune});
    }
}
