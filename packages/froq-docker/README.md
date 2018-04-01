# froq-docker

![Travis branch](https://img.shields.io/travis/DaAitch/froq/master.png?style=flat-square)
![Stability](https://img.shields.io/badge/Stability-experimental-orange.png?style=flat-square)
![Looking for Contributors](https://img.shields.io/badge/Looking%20for-Contributors-green.png?style=flat-square)

![npm](https://img.shields.io/npm/v/froq-docker.png?style=flat-square)
![node](https://img.shields.io/node/v/froq-docker.png?style=flat-square)

![license](https://img.shields.io/github/license/DaAitch/froq.png?style=flat-square)
![GitHub tag](https://img.shields.io/github/tag/DaAitch/froq.png?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/DaAitch/froq.png?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/DaAitch/froq.png?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/DaAitch/froq.png?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/DaAitch/froq.png?style=flat-square)

<img src="froq.png" width="100" alt="froQ logo" />

- [npm](https://www.npmjs.com/package/froq-docker)
- [GitHub](https://github.com/DaAitch/froq/tree/master/packages/froq-docker)

`froq-docker` is partially implemented according to [Docker Engine 1.37](https://docs.docker.com/engine/api/v1.37/). This still a WIP project and there is a lot to do. We also tried to give the same name as in the docker API, so some attributes are just called `t`, but you can easily find them in the docs.

## Usage

`npm install froq-docker`

We use npm package `debug`. To make me verbose use `DEBUG=froq-docker`.


### Create Docker

*At current we only support socket file.*

```js
import {Docker} from 'froq-docker';
const docker = Docker.fromSocket();
```


### Start Container

```js
const image = await docker.pull({fromImage: 'library/httpd', tag: 'latest'});

const container = await image.createContainer({
    data: {
        HostConfig: {
            PortBindings: {
                '80/tcp': [
                    {HostPort: ''} // any port
                ]
            }
        }
    }
});
await container.start();

const inspection = await container.inspect();
const address = inspection.getFirstHostAddress('80/tcp');

// open browser with `address`
```


### Build Image

```js

// it should contain:
// 1. Dockerfile
// 2. all resources reference in Dockerfile
const buildTar = 'build.tar.gz';

// stats from tar file
const stats = await stat(buildTar);

// create read stream for tar file
const writeStream = fs.createReadStream(buildTar);

// build image
const image = await docker.build({
    t: 'mynewimage',
    writeStream,
    contentType: 'application/x-gzip'
});

// use it
const container = await image.createContainer({
    data: {
        HostConfig: {
            PortBindings: {
                '80/tcp': [
                    {HostPort: ''}
                ]
            }
        }
    }
});
```


### Cleanup Container

```js
await container.stop();
await container.wait();
await container.remove();
```


### Cleanup Image

```js
await image.remove();
```


### List all Containers

```js
const containers = await docker.listContainers();
```


### List all Images

```js
const images = await docker.listImages();
```


### Attach Container

```js
await container.attach(raw => {
    raw.stdout.on('data', chunk => {
        // what the container writes to stdout
    });

    raw.stderr.on('data', chunk => {
        // what the container writes to stderr
    });

    // close raw stream
    // raw.end()
});
```


### Exec Container

```js
const exec = await container.createExec({
    AttachStdin: true,
    AttachStdout: true,
    AttachStderr: true,
    DetachKeys: 'ctrl-p,ctrl-q',
    Tty: true,
    Cmd: [
        '/bin/bash'
    ]
});

await exec.start({
    Detach: false,
    Tty: true
}, duplex => {

    duplex.out.on('data', chunk => {
        console.log(`server writes: ${chunk.toString()}`);
    });

    duplex.write('echo "Awesome!"\n').then(() => {
        duplex.end();
    });
});
```


## Tests

To get a better understanding, also read the [Tests](https://github.com/DaAitch/froq/tree/master/packages/froq-docker/test/Docker.test.js)
