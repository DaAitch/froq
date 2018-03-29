import Server from './Server';
import {resp} from './util';

const http = async (name = 'http-server', port = undefined) => {
    const server = new Server(name, port);
    await server.start();

    return server;
};

http.resp = resp;

export default http;
export {
    Server
};
