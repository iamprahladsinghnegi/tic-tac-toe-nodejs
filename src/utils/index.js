const crypto = require("crypto");

const generateRoomId = () => {
    return crypto.randomBytes(5).toString('hex').toUpperCase();
}

module.exports = {
    generateRoomId
}