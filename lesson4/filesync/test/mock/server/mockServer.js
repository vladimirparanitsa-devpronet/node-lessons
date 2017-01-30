const http = require('http');
const listenPort = process.argv[2] || 3001;

http
    .createServer((req, res) => {
        console.log(req.params);
        res.end();
    })
    .listen(listenPort);