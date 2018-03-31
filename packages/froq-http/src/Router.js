export default class Router {
    constructor () {
        this.routes = [];
    }

    async handle (req, resp, next, lastRoute = undefined) {
        const route = this.routes[
            lastRoute === undefined
                ? 0
                : this.routes.findIndex(route_ => route_ === lastRoute) + 1
        ];

        if (!route) {
            await next();
            return;
        }

        await route.handle(req, resp, async () => {
            await this.handle(req, resp, next, route);
        });
    }

    add (route) {
        this.routes.push(route);
    }
}
