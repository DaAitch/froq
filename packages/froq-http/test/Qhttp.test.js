import {test} from 'ava';
import fetch from 'node-fetch';
import http from '../src';

// Tue Dec 12 2017 00:00:00 GMT+0100
// const Q_NULL = 1513033200000;
// const Q_NULL_DATE = new Date(Q_NULL);

test('should do simple request', async t => {
    const server = await http();
    
    server
        .rest `/news`
        .type('json')
        .respond({test: true})
    ;

    const result = await fetch(server.url('/news'));
    const json = await result.json();
    t.deepEqual(json, {test: true});
    
    await server.stop();
});

test('should do templated request', async t => {
    const server = await http();
    
    server
        .rest `/news/${'id'}`
        .respond(({result}) => {
            t.is(result[0], '12345');
            t.is(result.id, '12345');
            return http.resp({
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

test('should proxy', async t => {
    const [server1, server2] = await Promise.all([http('server1'), http('server2')]);

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
        t.deepEqual(json, ['doc1', 'doc2']);
    }
    
    await Promise.all([server1.stop(), server2.stop()]);
});

test('should return error', async t => {
    const server = await http();

    server
        .rest `/api/error`
        .respond(() => http.resp({
            status: 404,
            type: 'json',
            body: 'Not Found'
        }))
    ;

    const result = await fetch(server.url('/api/error'));
    t.is(result.status, 404);
    t.is(await result.json(), 'Not Found');

    await server.stop();
});

test('should respond to body', async t => {
    const server = await http();

    server
        .rest `/api/endpoint`
        .type('json')
        .respond(({body}) => ({
            a: body.a + 1,
            b: body.b + 'b'
        }))
    ;

    const result = await fetch(server.url('/api/endpoint'), {
        method: 'POST',
        headers: {
            'content-type': 'application/json'
        },
        body: JSON.stringify({
            a: 1,
            b: 'b'
        })
    });

    t.deepEqual(await result.json(), {
        a: 2,
        b: 'bb'
    });

    await server.stop();
});

test('should understand server type, route type, response type', async t => {
    const server = await http();

    server
        .type('json')

        .rest `/api/json`
        .respond({
            json: true
        })

        .rest `/api/html`
        .type('text/html')
        .respond('<p>Html</p>')

        .rest `/api/txt`
        .respond(http.resp({type: 'txt', body: 'This is a text.'}))
    ;

    {
        const result = await fetch(server.url('/api/json'));
        t.is(result.headers.get('content-type'), 'application/json');
        t.deepEqual(await result.json(), {json: true});
    }

    {
        const result = await fetch(server.url('/api/html'));
        t.is(result.headers.get('content-type'), 'text/html');
        t.deepEqual(await result.text(), '<p>Html</p>');
    }

    {
        const result = await fetch(server.url('/api/txt'));
        t.is(result.headers.get('content-type'), 'text/plain');
        t.deepEqual(await result.text(), 'This is a text.');
    }


    await server.stop();
});

test('should throw illegal type', async t => {
    const server = await http();
    t.throws(() => server.type('xxx'));

    t.throws(() => {
        server
            .rest `/api1`
            .type('xxx')
        ;
    });

    
    server
        .rest `/api2`
        .respond(() => http.resp({
            type: 'xxx'
        }))
    ;

    const result = await fetch(server.url('/api2'));
    t.is(result.status, 500);

    await server.stop();
});

test('should not add erroneous routes', async t => {
    const server = await http();

    server
        .rest `/api`
    ;

    const result = await fetch(server.url('/api'));
    t.is(result.status, 404);

    await server.stop();
});

test('should', async t => {
    const server = await http();

    server
        .rest `/login`
        .type('json')
        .respond(({body}) => {
            if (body.username === 'user' && body.password === 'pass') {
                return {
                    login: true
                };
            }

            return http.resp({
                status: 401,
                body: {
                    login: false
                }
            });
        })
    ;

    {
        const response = await fetch(server.url('/login'), {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username: 'user',
                password: 'pass'
            })
        });
    
        t.deepEqual(await response.json(), {login: true});
    }

    {
        const response = await fetch(server.url('/login'), {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                username: 'invalid_user',
                password: 'invalid_pass'
            })
        });
    
        t.deepEqual(await response.json(), {login: false});
    }
    

    await server.stop();
});


// test.only('should', async t => {
//     const server = await Qhttp();

//     server
//         .rest `/api`
//         .respond(Qhttp.resp({
//             cookie: {
//                 cookie1: 'value1',
//                 cookie2: {
//                     value: 'value2',
//                     expires: Q_NULL + 1 * 1000 * 60 * 60 * 24 // 1h
//                 },
//                 cookie3: {
//                     value: 'value3',
//                     expires: Q_NULL_DATE.getDate() + 2 // 1 day
//                 },
//                 cookie4: {
//                     value: 'value4',
//                     path: '/api'
//                 },
//                 cookie5: {
//                     value: 'value5',
//                     httpOnly: true
//                 },
//                 cookie6: {
//                     value: 'value6',
//                     maxAge: 10 * 60 // 10min
//                 }
//             }
//         }))
//     ;

//     const result = await fetch(server.url('/api'));
//     console.log(result.headers);
//     // t.is(result.headers, 404);

//     await server.stop();
// });

// Set-Cookie: <cookie-name>=<cookie-value>
// Set-Cookie: <cookie-name>=<cookie-value>; Expires=<date>
// Set-Cookie: <cookie-name>=<cookie-value>; Max-Age=<non-zero-digit>
// Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>
// Set-Cookie: <cookie-name>=<cookie-value>; Path=<path-value>
// Set-Cookie: <cookie-name>=<cookie-value>; Secure
// Set-Cookie: <cookie-name>=<cookie-value>; HttpOnly

// Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Strict
// Set-Cookie: <cookie-name>=<cookie-value>; SameSite=Lax

// // Multiple directives are also possible, for example:
// Set-Cookie: <cookie-name>=<cookie-value>; Domain=<domain-value>; Secure; HttpOnly
