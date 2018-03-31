import httpProxy from 'http-proxy';
import debug from './debug';
import {contentTypeLookupOrThrow, resultByPlaceholders, qSymbol, respBodyForType, reqBodyForType} from './util';

export default class Rest {

    /**
     * @param {Route} route
     */
    constructor ({route, router, placeholders, server}) {
        this._route = route;
        this._router = router;
        this._placeholders = placeholders;
        this._server = server;
    }

    type (type) {
        this._type = contentTypeLookupOrThrow(type);
        return this;
    }

    respond (respondParam) {
        
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
    
            let type;
        
            if (isQResponse) {
                if ('status' in innerRespondParam) {
                    resp.statusCode = innerRespondParam.status;
                }
        
                if ('type' in innerRespondParam) {
                    debug('using type %s from response type', innerRespondParam.type);
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
                    debug('using type %s from rest type', this._type);
                    type = this._type;
                } else if (this._server.type !== undefined) {
                    debug('using type %s from server type', this._server._type);
                    type = this._server._type;
                }
    
                if (type) {
                    resp.setHeader('content-type', type);
                } else {
                    debug('unknown type');
                }
                
            }
            
            if (!isQResponse) {
                resp.write(respBodyForType(type, innerRespondParam));
            }
    
            resp.end();
        };

        
        return this._server;
    }

    proxy (expr) {

        let target = expr;
        if (typeof expr !== 'string') {
            target = `http://${expr.address}`;
        }
    
        const proxy = httpProxy.createProxyServer({
            target,
            ws: true,
            changeOrigin: true
        });
    
        this._route.processor = (req, resp) => {
            return new Promise((resolve, reject) => {
                debug('using proxy: %s %s -> %s(%s)', req.method, req.url, this._server._name, target);
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
