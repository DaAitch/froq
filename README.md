# froQ

<img src="froq.png" width="100" alt="froQ logo" />

Stage is very early alpha. Feel free to try **froQ**, but be aware: at current we are experimental.

## Currently we support

- HTTP (http servers, ReST endpoints)
- Docker (pull images, start containers, etc.)
- Glassfish (view logs, deploy artifacts)
- more to come

## Example: Docker + Payara - Glassfish deploy

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