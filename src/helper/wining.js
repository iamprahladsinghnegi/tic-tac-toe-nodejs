const WIN_CONDITION = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
];
// const checkWinner = (board) => {
//     for (let i = 0; i < WIN_CONDITION.length; i++) {
//         const [a, b, c] = WIN_CONDITION[i];
//         if (board[a] && board[a] === board[b] && board[a] === board[c]) {
//             return { combination: WIN_CONDITION[i], symbol: board[a] };
//         }
//     }
//     return null;
// }
const checkWinner = (board, symbol) => {
    let plays = board.reduce((a, e, i) =>
        (e === symbol) ? a.concat(i) : a, []);
    let gameWon = null;
    for (let [index, win] of WIN_CONDITION.entries()) {
        if (win.every(elem => plays.indexOf(elem) > -1)) {
            gameWon = { index: index, symbol: symbol };
            break;
        }
    }
    return gameWon;
}

module.exports = { checkWinner };
