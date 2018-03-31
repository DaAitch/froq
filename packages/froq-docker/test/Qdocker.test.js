import {test} from 'ava';
import Qdocker from '../src';

// test('should start docker and shutdown, cleanup', async t => {
//     const docker = Qdocker.fromSocket();
//     await docker.pull('alpine');

//     const container = await docker.createContainer('alpine')
//         .build()
//     ;

//     await container.start();

//     await container.stop();
//     await container.remove();

//     t.pass();
// });

test.serial('should start docker and shutdown, cleanup', async t => {
    const docker = Qdocker.fromSocket();
    
    console.info('pull image');
    const image = await docker.pull({fromImage: 'library/alpine'}, event => {
        console.info(event.status);
    });

    const container = await image.createContainer().build();
    await container.start();
    
    // await container.start();

    // await container.stop();
    // await container.remove();

    t.pass();
});

test.serial('should get containers', async t => {
    const docker = Qdocker.fromSocket();
    const containers = await docker.getContainers();
    t.truthy(Array.isArray(containers));
});
