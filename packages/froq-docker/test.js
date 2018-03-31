const request = require('request');
const util = require('util');

const get = util.promisify(request.get);

get('http://unix:/var/run/docker.sock:/v1.24/containers/json', {
    headers: {
        host: 'localhost'
    }
}).then(res => {
    console.log(res.body);
    res.on('data', data => {
        console.log(data);
    });
});
