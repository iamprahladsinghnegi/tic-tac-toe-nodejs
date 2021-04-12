const Datastore = require('nedb')

class InMemoryStorage {
    constructor() {
        if (InMemoryStorage.instance) {
            throw new Error("You can't create object. Use InMemoryStorage.getInstance()");
        }
    }

    static getInstance() {
        if (!InMemoryStorage.instance) {
            InMemoryStorage.instance = new InMemoryStorage();
        }
        return InMemoryStorage.instance;
    }

    initDataStore() {
        this.db = new Datastore();
    }

    adddPlayerInRoomById(roomId, playerId, symbol, isBot, currentTurn) {
        return new Promise((resolve, reject) => {
            this.db.update({ roomId }, { $addToSet: { players: { id: playerId, symbol } }, $inc: { userCount: 1 }, $set: { isBot, currentTurn } }, { returnUpdatedDocs: true }, (err, numAffected, affectedDocuments, upsert) => {
                if (err || numAffected === 0) {
                    return reject(new Error('playerJoin'));
                }
                return resolve(affectedDocuments);
            });
        })
    }

    updateCurrentTurn(playerId) {
        return new Promise((resolve, reject) => {
            this.db.update({ roomId }, { $set: { currentTurn: playerId } }, {}, (err, doc) => {
                if (err) {
                    return reject(err);
                }
                return resolve(doc);
            });
        })
    }

    getRoomById(roomId) {
        return new Promise((resolve, reject) => {
            this.db.findOne({ roomId }, (err, doc) => {
                if (err) {
                    return reject(new Error('roomIdDoesNotExists'));
                }
                return resolve(doc);
            });
        })
    }

    insert(record) {
        return new Promise((resolve, reject) => {
            this.db.insert({ ...record, board: Array.from(Array(9).keys()) }, (err, doc) => {
                if (err) {
                    return reject(new Error('createRoom'));
                }
                return resolve(doc);
            });
        })
    }

    makeMove(roomId, board, position, symbol, opponentId) {
        return new Promise((resolve, reject) => {
            if (typeof board[position] !== 'number') {
                return reject(new Error('positionFilled'));
            }
            board[position] = symbol;
            this.db.update({ roomId }, { $set: { board, currentTurn: opponentId }, $inc: { moveCount: 1 } }, { returnUpdatedDocs: true }, (err, numAffected, affectedDocuments, upsert) => {
                if (err || numAffected === 0) {
                    return reject(new Error('makeMoveDB'));
                }
                return resolve(affectedDocuments);
            });
        })
    }

    deleteSocketConnection(roomId, socketId) {
        return new Promise((resolve, reject) => {
            this.db.update({ roomId }, { $pull: { players: { id: socketId } }, $inc: { userCount: -1 }, $set: { board: Array.from(Array(9).keys()) } }, { returnUpdatedDocs: true }, (err, numAffected, affectedDocuments, upsert) => {
                if (err || numAffected === 0) {
                    return reject(new Error('removeSocketDB'));
                }
                return resolve(affectedDocuments);
            });
        })
    }

    deleteRoomById(roomId) {
        return new Promise((resolve, reject) => {
            this.db.remove({ roomId }, {}, (err, numRemoved) => {
                if (err || numRemoved !== 1) {
                    return reject(new Error('removeRoomDB'));
                }
                return resolve(true);
            });
        })
    }

    resetBoard(roomId, playerId) {
        return new Promise((resolve, reject) => {
            this.db.update({ roomId }, { $set: { board: Array.from(Array(9).keys()), currentTurn: playerId, moveCount: 0 } }, { returnUpdatedDocs: true }, (err, numAffected, affectedDocuments, upsert) => {
                if (err || numAffected === 0) {
                    return reject(new Error('resetBoardDB'));
                }
                return resolve(affectedDocuments);
            });
        })
    }
}

module.exports = InMemoryStorage;
