const { checkWinner } = require("./wining");
let boardWithIndex = null;

const availableMoves = (board) => {
    return boardWithIndex.filter((ele) => typeof ele === 'number')
}

const getBotMove = (board, symbol) => {
    let square;
    boardWithIndex = board;
    let currentAvailableMoves = availableMoves(boardWithIndex);
    if (currentAvailableMoves.length == 9) {
        square = currentAvailableMoves[Math.floor(Math.random() * currentAvailableMoves.length)]
    }
    else {
        square = minimax(boardWithIndex, symbol)['index'];
    }
    console.log('square, move', square)
    return square
}

const getPlayerSymbol = () => {
    return { humanPlayer: "O", aiPlayer: "X" }
}

const minimax = (newBoard, player) => {
    let availSpots = availableMoves();
    let { humanPlayer, aiPlayer } = getPlayerSymbol();
    if (checkWinner(newBoard, humanPlayer)) {
        return { score: -10 };
    } else if (checkWinner(newBoard, aiPlayer)) {
        return { score: 10 };
    } else if (availSpots.length === 0) {
        return { score: 0 };
    }
    let moves = [];
    for (let i = 0; i < availSpots.length; i++) {
        let move = {};
        move.index = newBoard[availSpots[i]];
        newBoard[availSpots[i]] = player;

        if (player == aiPlayer) {
            let result = minimax(newBoard, humanPlayer);
            move.score = result.score;
        } else {
            let result = minimax(newBoard, aiPlayer);
            move.score = result.score;
        }

        newBoard[availSpots[i]] = move.index;

        moves.push(move);
    }

    let bestMove;
    if (player === aiPlayer) {
        let bestScore = -1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score > bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    } else {
        let bestScore = 1000;
        for (let i = 0; i < moves.length; i++) {
            if (moves[i].score < bestScore) {
                bestScore = moves[i].score;
                bestMove = i;
            }
        }
    }
    return moves[bestMove];
}

module.exports = { getBotMove };
