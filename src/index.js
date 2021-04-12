require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const router = require('./router');
const cors = require('cors');
const matchHandler = require('./handler/matchHandler');
const InMemoryStorage = require('./inMemoryStorage');
const actionHandler = require('./handler/actionHandler');
const server = http.createServer(app);

const PORT = process.env.PORT || 3003;
const CLIENT_APP = process.env.CLIENT_APP || "http://localhost:3000";

const io = require('socket.io')(server, {
    cors: {
        origin: CLIENT_APP,
        // methods: ["GET", "POST"]
    }
});

const onConnection = (socket) => {
    matchHandler(io, socket);
    actionHandler(io, socket);
}

(() => {

    app.use(cors());

    // express routes
    app.use(router);

    //init inMemoryDB
    InMemoryStorage.getInstance().initDataStore();

    // register handlers
    io.on("connection", onConnection);

    server.listen(PORT, () => {
        console.log(`Server started successfully on PORT ${PORT}`);
    });

})();
