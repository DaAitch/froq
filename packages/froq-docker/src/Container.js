import { log } from 'froq-util';
import Dockerode from 'dockerode';

export default class Container {
    
    /**
     * 
     * @param {Dockerode.Container} container 
     */
    constructor(container) {
        this._container = container;
    }

    async start() {
        log.info('start container');
        const startResult = await this._container.start()
        this._inspection = await this.inspect();

        log.info('start container done');

        return startResult;
    }

    async stop() {
        log.info('stop container');
        const result = await this._container.stop();
        log.info('stop container done');
        return result;
    }
       
    async remove() {
        log.info('remove container');
        const result = await this._container.remove();
        log.info('remove container done');
        return result;
    }
    
    async inspect() {
        log.info('inspect container');
        const result = await this._container.inspect();
        log.info('inspect container done');

        return result;
    }

    getHostAddresses(port) {
        return this._inspection.NetworkSettings.Ports[port].map(x => `${x.HostIp}:${x.HostPort}`); // IPv6?
    }

    getHostAddress(port) {
        const addresses = this.getHostAddresses(port);
        if (addresses.length === 0) {
            return null;
        }
        
        return addresses[0];
    }
}