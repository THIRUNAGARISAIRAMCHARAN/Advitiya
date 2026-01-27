const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Test server ok\n');
});
server.listen(3002, () => {
    console.log('Test server running on http://localhost:3002');
});
