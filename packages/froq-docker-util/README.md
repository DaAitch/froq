# froq-docker-util

![Travis branch](https://img.shields.io/travis/DaAitch/froq/master.png?style=flat-square)
![Stability](https://img.shields.io/badge/Stability-experimental-orange.png?style=flat-square)
![Looking for Contributers](https://img.shields.io/badge/Looking%20for-Contributers-green.png?style=flat-square)

![npm](https://img.shields.io/npm/v/froq-docker-util.png?style=flat-square)
![node](https://img.shields.io/node/v/froq-docker-util.png?style=flat-square)

![license](https://img.shields.io/github/license/DaAitch/froq.png?style=flat-square)
![GitHub tag](https://img.shields.io/github/tag/DaAitch/froq.png?style=flat-square)
![GitHub issues](https://img.shields.io/github/issues/DaAitch/froq.png?style=flat-square)
![GitHub last commit](https://img.shields.io/github/last-commit/DaAitch/froq.png?style=flat-square)
![GitHub top language](https://img.shields.io/github/languages/top/DaAitch/froq.png?style=flat-square)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/DaAitch/froq.png?style=flat-square)

<img src="froq.png" width="100" alt="froQ logo" />

- [npm](https://www.npmjs.com/package/froq-docker-util)
- [GitHub](https://github.com/DaAitch/froq/tree/master/packages/froq-docker-util)

## Usage

`npm install froq-docker-util`

We use npm package `debug`. To make me verbose use `DEBUG=froq-docker-util`.


### Create Docker Build from `BuildStream`

```js
// default gzip
const bs = new BuildStream();

const [image] = await Promise.all([
    docker.build({
        t: imageName,
        bodyStream: bs.stream,
        bodyContentType: bs.contentType
    }),
    (async () => {
        // add file as buffer
        await bs.addFileAsBuffer('Dockerfile', `
# your Dockerfile content
`);

        // add file as stream
        await bs.addFileAsStream('file2.txt', 7, stream => {
            stream.write('stream2');
            stream.end();
        });

        // add file
        await bs.addFileFromFile(__dirname + '/file3.txt');

        // add folder
        await bs.addFileFromFile(__dirname + '/dir');

        // add file with different root: 'dir1/file4.txt'
        await bs.addFileFromFile(__dirname + '/file4.txt', 'dir1');

        // add folder with different root: 'dir2/...'
        await bs.addFileFromFile(__dirname + '/dirB', 'dir2');

        // build stream ends
        bs.end();
    })()
]);
```
