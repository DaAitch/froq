import fetch from 'node-fetch';
import { log } from 'froq-util';
import FormData from 'form-data';
import fs from 'fs';
import { format } from 'url';
import path from 'path';
import OperationResult from './OperationResult';

export default class Glassfish {
    constructor(url, user, password) {
        this._url = url;
        this._user = user;
        this._password = password;
        this._gftoken = undefined;
        this._textAppendNextUrl = undefined;
    }

    _restUrl(path) {
        return this._url + path;
    }

    async _fetch(url, opts) {

        opts = {...opts};
        opts.headers = {
            'x-requested-by': 'GlassFish REST HTML interface', // important -.-
            'content-type': 'application/json',
            ...(this._gftoken ? {
                cookie: `gfresttoken=${this._gftoken}`
            } : {
                authorization: `Basic ${new Buffer(`${this._user}:${this._password}`).toString('base64')}`
            }),
            ...(opts.headers || {})
        };
        
        log.info(`fetch ${url} with ${JSON.stringify(opts)}`);
        const response = await fetch(url, opts);

        return response;
    }

    async _auth() {
        if (this._gftoken) {
            return;
        }

        const response = await this._fetch(this._restUrl('/management/sessions.json'), {
            method: 'POST',
            body: JSON.stringify({})
        });

        const json = await response.json();

        const gftoken = json.extraProperties.token;
        log.info(`got token ${gftoken}`)
        this._gftoken = gftoken;
    }

    async logs() {
        await this._auth();

        const response = await this._fetch(this._restUrl('/management/domain/view-log'), {
            method: 'GET',
            body: JSON.stringify({})
        });

        this._textAppendNextUrl = response.headers['X-Text-Append-Next'];

        return await response.text();
    }

    async nextLogs() {
        await this._auth();

        if (!this._textAppendNextUrl) {
            await this.logs();
            return '';
        }

        const response = await this._fetch(this._textAppendNextUrl, {
            method: 'GET',
            body: JSON.stringify({})
        });

        this._textAppendNextUrl = response.headers['X-Text-Append-Next'];

        return await response.text();
    }

    async deploy(filePath, {type, contextRoot} = {}) {
        await this._auth();

        

        const parse = path.parse(filePath);

        // type
        type = type || parse.ext.substr(1); // without dot
        if (['war', 'ear', 'rar', 'jar'].findIndex(t => t === type) === -1) {
            type = 'other';
        }

        // context root
        contextRoot = contextRoot || parse.name;


        // id
        const id = fs.createReadStream(filePath);

        const formData = new FormData();
        formData.append('id', fs.createReadStream(filePath));
        formData.append('type', type);
        formData.append('contextroot', contextRoot)
        
        
        const response = await this._fetch(this._restUrl('/management/domain/applications/deploy.json'), {
            method: 'POST',
            headers: formData.getHeaders(),
            body: formData
        });

        id.close();

        return new OperationResult(await response.json());
    }
}