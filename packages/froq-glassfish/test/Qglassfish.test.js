import { test } from 'ava';
import Qdocker from 'froq-docker';

let docker;

test.before(async () => {
    docker = Qdocker.fromSocket();
    await docker.pull('payara/server-full');
});

test('', t => {
    
});