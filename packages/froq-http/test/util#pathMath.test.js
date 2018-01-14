import { test } from 'ava';
import { pathMatch } from '../src/util';


test('should match without placeholder', t => {
    const s1 = (function*() {
        t.deepEqual(yield, ['/news', 5]);
        return [0, 5];
    })();
    s1.next();

    const p1 = (function*() {
        t.is(yield, '');
        return true;
    })();
    p1.next();

    t.deepEqual(
        pathMatch(
            '/news',
            [
                (path, index) => s1.next([path, index]).value
            ], [
                placeholder => p1.next(placeholder).value
            ]
        ),
        ['']
    );
});

test('should match one placeholder', t => {

    const strings = (function*() {
        t.deepEqual(yield, ['/news/5', 7]);
        t.deepEqual(yield [0, 6], ['5', 1]);
        return [1, 0];
    })();
    strings.next();

    const placeholders = (function*() {
        t.is(yield, '');
        t.is(yield true, '5');
        return true;
    })();
    placeholders.next();

    t.deepEqual(
        pathMatch(
            '/news/5',
            [
                (path, index) => strings.next([path, index]).value,
                (path, index) => strings.next([path, index]).value
            ], [
                placeholder => placeholders.next(placeholder).value,
                placeholder => placeholders.next(placeholder).value
            ]
        ),
        ['', '5']
    );
});

test('should match complex', t => {
    const strings = (function*() {
        t.deepEqual(yield, ['/news/12345-froq-is-awesome/1234', 32]);
        t.deepEqual(yield [0, 6], ['12345-froq-is-awesome/1234', 26]);
        t.deepEqual(yield [21, 1], ['1234', 4]);
        return [4, 0];
    })();
    strings.next();

    const placeholders = (function*() {
        t.is(yield, '');
        t.is(yield true, '12345-froq-is-awesome');
        t.is(yield true, '1234');
        return true;
    })();
    placeholders.next();

    t.deepEqual(
        pathMatch(
            '/news/12345-froq-is-awesome/1234',
            [
                (path, index) => strings.next([path, index]).value,
                (path, index) => strings.next([path, index]).value,
                (path, index) => strings.next([path, index]).value
            ], [
                placeholder => placeholders.next(placeholder).value,
                placeholder => placeholders.next(placeholder).value,
                placeholder => placeholders.next(placeholder).value
            ]
        ),
        [
            '',
            '12345-froq-is-awesome',
            '1234'
        ]
    )
});