import debug from './debug';

const nextTick = async () => await new Promise((resolve, reject) => process.nextTick(resolve));
const timeout = async millis => await new Promise((resolve, reject) => setTimeout(resolve, millis));

export default async ({try: try_, total = 10000, defer = undefined, max = 100}) => {
    
    let i = 0;

    const now = Date.now();
    let exceptions = [];

    while (now + total > Date.now() && i < max) {
        try {
            ++i;
            return await try_();
        } catch (e) {
            debug('try %d failed', i);
        }

        if (defer !== undefined) {
            debug('wait %d ms', defer);
            await timeout(defer);
        } else {
            await nextTick(); // try_ might be sync, thus we need async
        }
    }

    const err = new Error('retry failed ' + i + ' times');
    err.exceptions = exceptions;
    throw err;
};