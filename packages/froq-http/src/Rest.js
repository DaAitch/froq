import { log } from 'froq-util';
import httpProxy from 'http-proxy';
import Route from './Route';
import { contentTypeLookupOrThrow, resultByPlaceholders, qSymbol, respBodyForType, reqBodyForType } from './util';

export default class Rest {

    /**
     * 
     * @param {Route} route 
     */
    constructor({route, router, placeholders, server}) {
        this._route = route;
        this._router = router;
        this._placeholders = placeholders;
        this._server = server;
    }

    type(type) {
        this._type = contentTypeLookupOrThrow(type);
        return this;
    }

    respond(respondParam) {
        
        this._router.add(this._route);
        this._route.processor = async (req, resp, result) => {
            let innerRespondParam = respondParam;
            
            result = resultByPlaceholders(this._placeholders, result);
            
            if (innerRespondParam instanceof Function) {
                innerRespondParam = innerRespondParam({
                    body: await reqBodyForType(req),
                    result
                });
            }
            
        
            if (innerRespondParam === null || innerRespondParam === undefined) {
                resp.end();
                return;
            }
    
            const isQResponse = typeof innerRespondParam === 'object' && qSymbol in innerRespondParam;
    
            let type = undefined;
        
            if (isQResponse) {
                if ('status' in innerRespondParam) {
                    resp.statusCode = innerRespondParam.status;
                }
        
                if ('type' in innerRespondParam) {
                    log.debug(`using type ${innerRespondParam.type} from response type`);
                    type = contentTypeLookupOrThrow(innerRespondParam.type);
                    resp.setHeader('content-type', type);
                }
        
                if ('body' in innerRespondParam) {
                    resp.write(respBodyForType(type, innerRespondParam.body));
                }
        
                if ('text' in innerRespondParam) {
                    resp.write(innerRespondParam.text);
                }
            }
            
            if (!type) {
                if (this._type !== undefined) {
                    log.debug(`using type ${this._type} from rest type`);
                    type = this._type;
                } else if (this._server.type !== undefined) {
                    log.debug(`using type ${this._server._type} from server type`);
                    type = this._server._type;
                }
    
                if (type) {
                    resp.setHeader('content-type', type);
                } else {
                    log.error(`unknown type!`);
                }
                
            }
            
            if (!isQResponse) {
                resp.write(respBodyForType(type, innerRespondParam));
            }
    
            resp.end();
        };

        
        return this._server;
    }

    proxy(expr) {

        let name = expr;
        let target = expr;
        if (typeof expr !== 'string') {
            name = expr.name;
            target = `http://${expr.address}`;
        }
    
        const proxy = httpProxy.createProxyServer({
            target,
            ws: true,
            changeOrigin: true
        });
    
        this._route.processor = (req, resp, result) => {
            return new Promise((resolve, reject) => {
                log.info(`using proxy: ${req.method} ${req.url} -> ${this._server._name}(${target})`);
                proxy.web(req, resp);
    
                resp
                    .on('finish', resolve)
                    .on('error', reject)
                ;
            });
        };
    
        this._router.add(this._route);
        
        return this._server;
    }
}