import {test} from 'ava';
import Qdocker from '../src';

test('should start docker and shutdown, cleanup', async t => {
    const docker = Qdocker.fromSocket();
    await docker.pull('alpine');

    const container = await docker.createContainer('alpine')
        .build()
    ;

    await container.start();

    await container.stop();
    await container.remove();

    t.pass();
});
