# froq-glassfish

<img src="froq.png" width="100" alt="froQ logo" />

- [npm](https://www.npmjs.com/package/froq-glassfish)
- [GitHub](https://github.com/DaAitch/froq/tree/master/packages/froq-glassfish)

## Usage

`npm install froq-glassfish`

We use npm package `debug`. To make me verbose use `DEBUG=froq-glassfish`.


### Deploy an artifact

```js
import {Glassfish} from 'froq-glassfish';

const gf = new Glassfish('https://localhost:4848', 'admin', 'admin');
await gf.deploy('my-program.war');
```
