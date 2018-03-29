import Router from './Router';
import Route from './Route';
import Connection from './Connection';
import Rest from './Rest';

import debug from './debug';

import {transformRestTemplate, createPathMatcherFromTemplate, contentTypeLookupOrThrow} from './util';

export default class Server {
    constructor (name, port) {
        this._name = name;
        this._port = port;

        this._connection = new Connection(name);
        this._router = new Router();

        this._connection.setHandler((req, resp, next) => this._router.handle(req, resp, next));
    }

    async start () {
        await this._connection.start(this._port);
    }

    async stop () {
        await this._connection.stop();
    }

    get name () {
        return this._name;
    }

    get address () {
        const address = this._connection.address;
        switch (address.family) {
            case 'IPv4': {
                return `${this._connection.address.address}:${this._connection.address.port}`;
            }
            case 'IPv6': {
                return `[${this._connection.address.address}]:${this._connection.address.port}`;
            }
            default: {
                return undefined;
            }
        }
    }

    url (path = '') {
        return `http://${this.address}${path}`;
    }

    type (type) {
        this._type = contentTypeLookupOrThrow(type);
        return this;
    }

    rest (strings, ...placeholders) {

        let method;
        [method, strings, placeholders] = transformRestTemplate(strings, placeholders);

        const route = new Route();
        const matcher = createPathMatcherFromTemplate(strings, ...placeholders);
        
        route.matcher = req => {
            if (method && req.method !== method) {
                return false;
            }

            const result = matcher(req.url);
            debug('%s: %s %s %s', this._name, req.url, result !== false ? 'matches' : 'not matches', strings.join('...'));

            return result;
        };

        route.processor = () => {
            throw new Error(`processor missing for ${strings.join('...')}.`);
        };
        
        return new Rest({route, router: this._router, placeholders, server: this});
    }
}
