const InMemoryStorage = require("../inMemoryStorage");
const { generateRoomId } = require("../utils");

const matchHandler = (io, socket) => {
    const createRoom = async ({ type }, callback) => {
        let roomId = generateRoomId();
        console.log(type, roomId, socket.id);
        socket.join(roomId);
        let inMemoryStorageInstance = InMemoryStorage.getInstance();
        let matchDetails = { userCount: 1, roomId, players: [{ id: socket.id, symbol: 'O' }], currentTurn: socket.id, moveCount: 0 };
        try {
            let record = await inMemoryStorageInstance.insert(matchDetails);
            console.log(record);
            if (type === 'multiPlayer') {
                io.to(roomId).emit('gameInit', { roomId, symbol: 'O' });
            } else {
                // set BOT as opponent
                let botId = socket.id + '-bot';
                let botAdded = await inMemoryStorageInstance.adddPlayerInRoomById(roomId, botId, 'X', true, socket.id);
                console.log(botAdded);
                io.to(roomId).emit('opponentJoined', { ...botAdded });
            }
        }
        catch (e) {
            let message, errorType;
            switch (e.message) {
                case "createRoom":
                    errorType = e.message;
                    message = 'Unable to create room';
                    break
                case "playerJoin":
                    errorType = 'botAdd';
                    message = 'Unable to add BOT!';
                    break;
                default:
                    errorType = 'Unknown';
                    message = 'Something went wrong!';
                    break;
            }
            callback({ errorType, error: message });
        }
    }

    const joinRoom = async ({ roomId }, callback) => {
        try {
            if (!roomId) {
                throw new Error('roomIdNotPresent');
            }
            let inMemoryStorageInstance = InMemoryStorage.getInstance();
            let currentMatch = await inMemoryStorageInstance.getRoomById(roomId);
            if (currentMatch.userCount === 2) {
                return callback({ errorType: 'roomFull', error: 'Sorry room is full!' });
            }
            socket.join(roomId);
            let symbol = currentMatch.players[0].symbol === "O" ? "X" : "O";
            let currentTurn = currentMatch.players[0].id;
            let playerAdded = await inMemoryStorageInstance.adddPlayerInRoomById(roomId, socket.id, symbol, false, currentTurn);
            // socket.to(roomId).emit('opponentJoined', { socketId: socket.id });
            io.to(roomId).emit('opponentJoined', playerAdded);
        }
        catch (e) {
            let message, errorType;
            switch (e.message) {
                case "roomIdNotPresent":
                    errorType = e.message;
                    message = 'RoomId Not Found!';
                    break
                case "roomIdDoesNotExists":
                    errorType = e.message;
                    message = 'Invalid roomId!';
                    break;
                case "roomFull":
                    errorType = e.message;
                    message = 'Sorry room is full!';
                    break;
                case "playerJoin":
                    errorType = e.message;
                    message = 'Unable to Join Room';
                    break;
                default:
                    errorType = 'Unknown';
                    message = 'Something went wrong!';
                    break;
            }
            callback({ errorType, error: message });
        }
    }

    const disconnect = async (reason) => {
        console.log(reason);
        const disconnectManual = await manualDisconnect({}, ({ errorType, error }) => {
            if (error) {
                console.log('unable to disconnected!', error);
            }
        });
        if (disconnectManual) {
            socket.disconnect();
        }
    }

    const manualDisconnect = async ({ }, callback) => {
        try {
            let socketId = socket.id;
            let inMemoryStorageInstance = InMemoryStorage.getInstance();
            for (const room of socket.rooms) {
                if (room !== socket.id) {
                    const isDeleted = await inMemoryStorageInstance.deleteSocketConnection(room, socketId);

                    socket.leave(room);
                    socket.to(room).emit("disconnected", { socketId, roomId: room });

                    if (isDeleted.userCount === 0) {
                        const isRoomDeleted = await inMemoryStorageInstance.deleteRoomById(room);
                        console.log(`room deleted ${room} : ${isRoomDeleted}`);
                    }
                }
            }
            return true
        }
        catch (e) {
            let message, errorType;
            switch (e.message) {
                case "removeSocketDB":
                    errorType = e.message;
                    message = 'Unable to remove socket!';
                    break
                case "removeRoomDB":
                    errorType = e.message;
                    message = 'Unable to delete room!';
                    break;
                default:
                    errorType = 'Unknown';
                    message = 'Something went wrong!';
                    break;
            }
            callback({ errorType, error: message });
        }
    }

    socket.on("startRoom", createRoom);
    socket.on("joinRoom", joinRoom);
    socket.on("manualDisconnect", manualDisconnect);
    socket.on("disconnecting", disconnect);
}

module.exports = matchHandler;
