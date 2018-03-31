
export default class Inspection {

    constructor (docker, data) {
        this._docker = docker;
        this._data = data;
    }

    get data () {
        return this._data;
    }

    get id () {
        const data = this.data;
        return data && data.Id;
    }

    get networkSettings () {
        const data = this.data;
        return data && data.NetworkSettings;
    }

    get ports () {
        const networkSettings = this.networkSettings;
        return networkSettings && networkSettings.Ports;
    }

    getHostAddresses (containerPort) {
        const ports = this.ports || {};
        const bindings = ports[containerPort] || [];
        return bindings
            .map(binding => binding && `${binding.HostIp}:${binding.HostPort}`)
            .filter(binding => binding)
        ;
    }

    getFirstHostAddress (containerPort) {
        const addresses = this.getHostAddresses(containerPort) || [];
        if (addresses.length > 0) {
            return addresses[0];
        }

        return undefined;
    }

}
