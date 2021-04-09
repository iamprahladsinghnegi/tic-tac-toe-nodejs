const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const PORT = 3003;

app.get('/', (_req, res) => {
    res.send(`<h1>Thanks for request!</h1>`);
});

server.listen(PORT, () => {
    console.log(`Server started successfully on PORT ${PORT}`);
});