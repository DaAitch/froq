import { test } from 'ava';
import { createPathMatcherFromTemplate } from '../src/util';

test('should create matcher for no parameter', t => {
    t.deepEqual(
        createPathMatcherFromTemplate `/news` ('/news'),
        []
    );
});

test('should create matcher for one parameter', t => {
    t.deepEqual(
        createPathMatcherFromTemplate `/news/${'id'}` ('/news/1234'),
        ['1234']
    );
});

test('should create matcher for one parameter', t => {
    t.deepEqual(
        createPathMatcherFromTemplate `/news/${/[a-f]+/}` ('/news/a4f12e2ab2'),
        ['a4f12e2ab2']
    );
});

test('should create matcher for indeterministic case', t => {
    t.deepEqual(
        createPathMatcherFromTemplate `/news/${'id'}/${'id2'}/${'id3'}` ('/news/1234/5/678'),
        ['1234', '5', '678']
    );
});

test('should match url rest', t => {
    t.deepEqual(
        createPathMatcherFromTemplate `/${'*'}` ('/api/news'),
        ['api/news']
    );
});