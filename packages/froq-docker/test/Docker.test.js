import {BuildStream} from 'froq-docker-util';

import {test} from 'ava';
import fetch from 'node-fetch';
import {retry} from 'froq-util';

import {Docker} from '../src';

test.beforeEach(async t => {
    t.context.docker = Docker.fromSocket();
});

test('should pull image, create/start/inpect/stop/wait/remove container', async t => {
    
    const image = await t.context.docker.pull({fromImage: 'library/httpd', tag: 'latest'});

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
    await container.start();

    const inspection = await container.inspect();
    t.is(inspection.id, container.id);
    t.truthy(inspection.getFirstHostAddress('80/tcp'));

    await container.stop();
    await container.wait();
    await container.remove();

    t.pass();
});

test('should list containers', async t => {
    const containers = await t.context.docker.listContainers();
    t.truthy(Array.isArray(containers));
});

test('should list images', async t => {
    const images = await t.context.docker.listImages();
    t.truthy(Array.isArray(images));
});

test('should build image from tar, fetch homepage, clean up', async t => {

    const imageName = 'froqdockerimage' + Date.now();

    const bs = new BuildStream();

    const [image] = await Promise.all([
        t.context.docker.build({
            t: imageName,
            writeStream: bs.stream,
            contentType: bs.contentType
        }),
        (async () => {
            await bs.addFileAsBuffer('Dockerfile', `
FROM httpd
COPY index.html /usr/local/apache2/htdocs/index.html
`);
            await bs.addFileAsBuffer('index.html', 'test_index');
            bs.end();
        })()
    ]);

    
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

    await container.start();
    const inspection = await container.inspect();
    const address = inspection.getFirstHostAddress('80/tcp');

    t.truthy(address);
    
    const res = await retry({try: () => fetch(`http://${address}`)});
    const text = await res.text();

    // from index.html
    t.is(text, 'test_index');

    await container.stop();
    await container.wait();
    await container.remove();

    await image.remove();

    t.pass();
});

test('should attach to container reading logs', async t => {
    
    const image = await t.context.docker.pull({fromImage: 'library/httpd', tag: 'latest'});

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
    await container.start();

    const inspection = await container.inspect();
    const address = inspection.getFirstHostAddress('80/tcp');

    await Promise.all([
        container.attach(raw => {
            let stdout = '';
            raw.stdout.on('data', chunk => {
                stdout += chunk.toString();

                if (stdout.indexOf('GET /test HTTP/1.1') !== -1) {
                    raw.end();
                }
            });
        }),
        retry({try: () => fetch(`http://${address}/test`)})
    ]);

    await container.stop();
    await container.wait();
    await container.remove();

    t.pass();
});

test('should create test.html via exec commands and test via fetch', async t => {
    
    const image = await t.context.docker.pull({fromImage: 'library/httpd', tag: 'latest'});

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
    await container.start();

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
        duplex.write('cd /usr/local/apache2/htdocs && echo "test_index" > test.html\n').then(() => {
            duplex.end();
        });
    });

    const inspection = await container.inspect();
    const address = inspection.getFirstHostAddress('80/tcp');

    const response = await retry({try: () => fetch(`http://${address}/test.html`)});
    const text = await response.text();
    t.is(text, 'test_index\n');

    await container.stop();
    await container.wait();
    await container.remove();

    t.pass();
});
