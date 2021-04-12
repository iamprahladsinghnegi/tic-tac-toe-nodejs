const { getBotMove } = require("../helper/bot");
const { checkWinner } = require("../helper/wining");
const InMemoryStorage = require("../inMemoryStorage");

const actionHandler = (io, socket) => {
    const onMove = async ({ roomId, index, socketId }, callback) => {
        try {
            if (!socketId) {
                socketId = socket.id;
            }
            let inMemoryStorageInstance = InMemoryStorage.getInstance();
            let currentMatch = await inMemoryStorageInstance.getRoomById(roomId);

            let player = currentMatch.players.find(ele => ele.id === socketId);
            let opponent = currentMatch.players.find(ele => ele.id !== socketId);
            let updatedMatch = await inMemoryStorageInstance.makeMove(roomId, currentMatch.board, index, player.symbol, opponent.id);

            io.to(roomId).emit('nextMove', { currentTurn: updatedMatch.currentTurn, board: updatedMatch.board });
            if (updatedMatch.moveCount >= 5) {
                const isWinner = checkWinner(updatedMatch.board, player.symbol);
                if (isWinner) {
                    return io.to(roomId).emit('gameResult', { result: 'Win', combination: isWinner.index, symbol: isWinner.symbol });
                } else if (updatedMatch.moveCount === 9) {
                    return io.to(roomId).emit('gameResult', { result: 'Tie', combination: null, symbol: null });
                }
            }
            if (updatedMatch.isBot) {
                //get move for bot
                let selectedIndex = getBotMove(updatedMatch.board, opponent.symbol);
                console.log('BOT"s Move', selectedIndex, opponent.symbol)
                let botsMove = await inMemoryStorageInstance.makeMove(roomId, updatedMatch.board, selectedIndex, opponent.symbol, player.id);

                io.to(roomId).emit('nextMove', { currentTurn: botsMove.currentTurn, board: botsMove.board });
                if (botsMove.moveCount >= 5) {
                    const isWinner = checkWinner(botsMove.board, opponent.symbol);
                    if (isWinner) {
                        return io.to(roomId).emit('gameResult', { result: 'Win', combination: isWinner.index, symbol: isWinner.symbol });
                    } else if (botsMove.moveCount === 9) {
                        return io.to(roomId).emit('gameResult', { result: 'Tie', combination: null, symbol: null });
                    }
                }
            }
        }
        catch (e) {
            let message, errorType;
            switch (e.message) {
                case "roomIdDoesNotExists":
                    errorType = e.message;
                    message = 'Invalid room Id!';
                    break
                case "positionFilled":
                    errorType = e.message;
                    message = 'Position already filled, choose other position!';
                    break;
                case "makeMoveDB":
                    errorType = e.message;
                    message = 'Unable to make a move!';
                    break;
                default:
                    errorType = 'Unknown';
                    message = 'Something went wrong!';
                    break;
            }
            callback({ errorType, error: message });
        }
    }

    const resetBoard = async ({ roomId }, callback) => {
        try {
            let inMemoryStorageInstance = InMemoryStorage.getInstance();
            const isResetGame = await inMemoryStorageInstance.resetBoard(roomId, socket.id);
            io.to(roomId).emit('resetGame', isResetGame);

        }
        catch (e) {
            let message, errorType;
            switch (e.message) {
                case "resetBoardDB":
                    errorType = e.message;
                    message = 'Unable to reset game!';
                    break
                default:
                    errorType = 'Unknown';
                    message = 'Something went wrong!';
                    break;
            }
            callback({ errorType, error: message });
        }
    }

    socket.on("resetBoard", resetBoard)
    socket.on("onMove", onMove);
}

module.exports = actionHandler;
