import debug from './debug';

export default class Route {

    constructor () {
        this.matcher = null;
        this.processer = null;
    }

    async handle (req, resp, next) {
        const result = this.matcher(req);
        
        if (result === false) {
            await next();
            return;
        }

        const procResult = this.processor(req, resp, result);
        await Promise.resolve(procResult);
        debug('route processed');

        if (!resp.finished) {
            resp.end();
        }
        
    }

    get placeholderCount () {
        return this.matcher.placeholderCount;
    }
}
