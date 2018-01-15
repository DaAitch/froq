# froQ

<img src="froq.png" width="100" alt="froQ logo" />

Stage is very early alpha. Feel free to try **froQ**, but be aware: at current we are experimental.

## Currently we support

- HTTP (http servers, ReST endpoints)
- Docker (pull images, start containers, etc.)
- Glassfish (view logs, deploy artifacts)
- more to come

## Examples

### Example 1: Docker + Payara - Glassfish deploy

```js
import { test } from 'ava';
import Q from 'froq';

test('should start payara, deploy artifact', async t => {
    const docker = Q.docker.fromSocket();
    
    await docker.pull('payara/server-full');
    const container = await docker
        .createContainer('payara/server-full')
        .bind('4848/tcp')
        .bind('8080/tcp')
        .build()
    ;
    await container.start();
    await new Promise((resolve, reject) => {setTimeout(resolve, 5000); }); // TODO implement retry mechanism

    const glassfish = Q.glassfish(`https://${container.getHostAddress('4848/tcp')}`, 'admin', 'admin');
    await glassfish.deploy(__dirname + '/../sample.war');

    // here your test
    
    await container.stop();
    await container.remove();

    t.pass('ok');
});
```

### Example 2: Simple HTTP ReST

```js
test('should do simple request', async t => {
    const server = await Qhttp();
    
    server
        .rest `/news`
        .type('json')
        .respond({test: true})
    ;

    const result = await fetch(`http://${server.address}/news`);
    const json = await result.json();
    t.deepEqual(json, {test: true});
    
    await server.stop();
});
```

### Example 3: Templated HTTP request

```js
test('should do templated request', async t => {
    const server = await Qhttp();
    
    server
        .rest `/news/${'id'}`
        .respond(({result}) => {
            t.is(result[0], '12345');
            t.is(result.id, '12345');
            return Qhttp.resp({
                type: 'json',
                body: result[0]
            });
        })
    ;

    const result = await fetch(server.url('/news/12345'));
    const json = await result.json();
    t.deepEqual(json, '12345');
    
    await server.stop();
});
```

### Example 4: Proxy

```js
test('should proxy', async t => {
    const [server1, server2] = await Promise.all([Qhttp('server1'), Qhttp('server2')]);

    server2
        .rest `/api/docs`
        .type('json')
        .respond([
            'doc1',
            'doc2'
        ]);
    
    server1
        .rest `/index.html`
        .type('html')
        .respond('<html>...</html>')

        .rest `/${'*'}`
        .proxy(server2)
    ;

    

    {
        const result = await fetch(server1.url('/index.html'));
        const text = await result.text();
        t.is(text, '<html>...</html>');
    }

    {
        const result = await fetch(server1.url('/api/docs'));
        const json = await result.json();
        t.deepEqual(json, ['doc1', 'doc2'])
    }
    
    await Promise.all([server1.stop(), server2.stop()]);
});
```