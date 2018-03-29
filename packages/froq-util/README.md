# froq-util

<img src="froq.png" width="100" alt="froQ logo" />

- [npm](https://www.npmjs.com/package/froq-util)
- [GitHub](https://github.com/DaAitch/froq/tree/master/packages/froq-util)

`froq-util` is a small util library for some useful stuff, needed for the `froq` packages.

## Usage

`npm install froq-util`

We use npm package `debug`. To make me verbose use `DEBUG=froq-util`.


### Parallel

`Promise.all` sometimes feels strange.

```js
import {parallel} from 'froq-util';

const [google, twitter] = parallel(fetch('https://google.de'), fetch('https://twitter.com));
```


### Retry

*retry is non-blocking lazy looping, also with `defer = 0`*

```js
import {retry} from 'froq-util';


// simple

const resp = await retry({try: () => fetch('https://mybooting-server/sanity')});
// resp.status: 200 (e.g.)


// more complex

const total = 30000; // millis
const defer = 1000; // 1sec between each try
const max = 100; // max iterations (as a total limit of tries at all)

await retry({try: () => fetch('https://my-crashed-server/sanity'), total, defer, max});
// throws: Error err (e.g.)
// all exceptions in `err.exceptions`
```