import {log} from 'froq-util';
import Docker from './Docker';

export default class Container {
    
    /**
     * @param {Docker} docker 
     * @param {any} body 
     */
    constructor (docker, id) {
        this._docker = docker;
        this._id = id;
    }

    async start () {
        log.info('start container');
        return await this._docker.startContainer(this._id);
    }

    // async stop () {
    //     log.info('stop container');
    //     const result = await this._container.stop();
    //     log.info('stop container done');
    //     return result;
    // }
       
    // async remove () {
    //     log.info('remove container');
    //     const result = await this._container.remove();
    //     log.info('remove container done');
    //     return result;
    // }
    
    // async inspect () {
    //     log.info('inspect container');
    //     const result = await this._container.inspect();
    //     log.info('inspect container done');

    //     return result;
    // }

    // getHostAddresses (port) {
    //     return this._inspection.NetworkSettings.Ports[port].map(x => `${x.HostIp}:${x.HostPort}`); // IPv6?
    // }

    // getHostAddress (port) {
    //     const addresses = this.getHostAddresses(port);
    //     if (addresses.length === 0) {
    //         return null;
    //     }
        
    //     return addresses[0];
    // }
}
