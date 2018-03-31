import util from 'util';
import Modem from 'docker-modem';

export default class DockerSocket {
    
    static fromSocketFile (path) {
        const modem = new Modem({path});
        return new DockerSocket(modem);
    }

    static fromTcp ({host, port}) {
        const modem = new Modem({
            host,
            port
        });
        return new DockerSocket(modem);
    }


    /**
     * @param {Modem} modem
     */
    constructor (modem) {
        this._modem = modem;
        
    }

    async createContainer (opts) {
        const result = await util.promisify(this._modem.dial.bind(this._modem))({
            path: '/containers/create?',
            method: 'POST',
            options: opts,
            statusCodes: {
                200: true, // unofficial, but proxies may return it
                201: true,
                404: 'no such container',
                406: 'impossible to attach',
                500: 'server error'
            }
        });

        console.log(result);
    }

}
