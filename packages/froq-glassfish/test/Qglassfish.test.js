import { test } from 'ava';
import Qdocker from 'froq-docker';
import { parallel } from 'froq-util';
import { default as createGlassfishClient } from '../src';
import { create as mavenCreate } from 'maven';
import { spawn } from 'child_process';

const payaraDockerName = 'payara/server-full';
const mvnProjectRoot = `${__dirname}/assets/helloworld`;
const targetPath = `${mvnProjectRoot}/target`;
const finalName = 'war-file';
const warFileName = `${finalName}.war`;
const targetFile = `${targetPath}/${warFileName}`;


test('should deploy', async t => {
    const docker = Qdocker.fromSocket();
    const mvn = mavenCreate({cwd: mvnProjectRoot});

    const [[container, glassfish]] = await parallel(
        async () => {
            await docker.pull(payaraDockerName);
            const container = await docker.createContainer(payaraDockerName)
                .bind('4848/tcp')
                .bind('8080/tcp')
                .build()
            ;

            await container.start();
            const glassfish = createGlassfishClient(`https://${container.getHostAddress('4848/tcp')}`, 'admin', 'admin');

            return [container, glassfish];
        },
        mvn.execute(['clean', 'package', `-Dfinal-name=${finalName}`])
    );

    await glassfish.deploy(targetFile);

    await container.stop();
    await container.remove();

    t.pass();
});