# froq-glassfish

![Travis branch](https://img.shields.io/travis/DaAitch/froq/master.png?style=flat-square)
![Stability](https://img.shields.io/badge/Stability-experimental-orange.png?style=flat-square)
![Looking for Contributers](https://img.shields.io/badge/Looking%20for-Contributers-green.png?style=flat-square)

![npm](https://img.shields.io/npm/v/froq-glassfish.png?style=flat-square)
![node](https://img.shields.io/node/v/froq-glassfish.png?style=flat-square)

![license](https://img.shields.io/github/license/DaAitch/froq.png?style=flat-square)
![GitHub tag](https://img.shields.io/github/tag/DaAitch/froq.png?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/DaAitch/froq.png?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/DaAitch/froq.png?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/DaAitch/froq.png?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/DaAitch/froq.png?style=flat-square)

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
