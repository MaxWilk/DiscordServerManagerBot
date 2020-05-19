var curTicTacToe = {};
var curConnectFour = {};

function startConnectFourGame(receivedMessage, size, num) {

    curConnectFour = {};

    if (num == undefined) {
        num = size;
    }

    curConnectFour.board = [];

    for (let i = 0; i < size; i++) {
        let cur = [];
        for (let j = 0; j < size; j++) {
            cur.push(0);
        }
        curConnectFour.board.push(cur);
    }

    curConnectFour.numToWin = num;
    if (curConnectFour.numToWin < 1) {
        curConnectFour.numToWin = 1;
    }

    curConnectFour.moveCount = 0;
    curConnectFour.curPlayer = 1;
    curConnectFour.playable = true;

    postConnectFourBoard(receivedMessage.channel);
    receivedMessage.channel.send("```" + getSymbolForConnectFour(curConnectFour.curPlayer) + " is up!```");

}

function playConnectFour(receivedMessage, x) {

    if (!curConnectFour.playable) {
        receivedMessage.channel.send("Start a new game to play!");
        return;
    }

    x--;

    if (curConnectFour.board[0][x] == 0) {

        curConnectFour.moveCount++;

        let lowestY = 0;

        for (let i = 0; i < curConnectFour.board.length; i++) {
            if (curConnectFour.board[i][x] == 0) {
                lowestY = i;
            }
        }

        curConnectFour.board[lowestY][x] = curConnectFour.curPlayer;

        let winner = checkBoardForWin(lowestY, x, curConnectFour.board, curConnectFour.curPlayer, curConnectFour.moveCount, curConnectFour.numToWin);

        if (winner == 0) {
            curConnectFour.curPlayer = curConnectFour.curPlayer == 1 ? 2 : 1;
            postConnectFourBoard(receivedMessage.channel);
            receivedMessage.channel.send("```" + getSymbolForConnectFour(curConnectFour.curPlayer) + " is up!```");
        } else {

            postConnectFourBoard(receivedMessage.channel);

            if (winner == 3) {
                curConnectFour.playable = false;
                receivedMessage.channel.send("*Draw!*");
            } else {
                curConnectFour.playable = false;
                receivedMessage.channel.send("```" + getSymbolForConnectFour(curConnectFour.curPlayer) + " wins!```");
            }

        }

    } else {
        receivedMessage.channel.send("Can't go there!");
    }

}

function postConnectFourBoard(channel) {

    let res = '╔';

    for (let i = 0; i < curConnectFour.board.length; i++) {
        res += "═══";
        if (i < curConnectFour.board.length - 1) {
            res += "╦";
        }
    }

    res += "╗\n║";

    for (let y = 0; y <= curConnectFour.board.length; y++) {
        if (y != 0 && y != curConnectFour.board.length) {
            res += "\n╠";
            for (let i = 0; i < curConnectFour.board.length; i++) {
                res += "═══";
                if (i < curConnectFour.board.length - 1) {
                    res += "╬";
                }
            }
            /*for (let i = 0; i < curConnectFour.board.length - 1; i++) {
                res += "═";
            }*/
            res += "╣\n║";
        }
        let row = curConnectFour.board[y];
        if (row != undefined) {
            for (let x = 0; x < row.length; x++) {
                res += " " + getSymbolForConnectFour(row[x]) + " " + (x != row.length - 1 ? "║" : "");
            }
            res += "║ ";
        } else {
            res += "\n╚";
            for (let i = 0; i < curConnectFour.board.length; i++) {
                res += "═══";
                if (i < curConnectFour.board.length - 1) {
                    res += "╩";
                }
            }
            res += "╝\n ";
            for (let x = 0; x < curConnectFour.board.length; x++) {
                res += " " + (x + 1).toString() + (x + 1 < 10 ? " " : "") + (x != curConnectFour.board.length - 1 ? " " : "");
            }
        }

    }

    res += "\n";

    channel.send("```" + res + "```");

}

function getSymbolForConnectFour(num) {

    let res = '';

    switch (num) {
        case 0:
            res = ' ';
            break;
        case 1:
            res = '●';
            break;
        case 2:
            res = '○';
            break;
    }

    return res;

}

function startTicTacToeGame(receivedMessage, size, num) {

    curTicTacToe = {};

    if (num == undefined) {
        num = size;
    }

    curTicTacToe.board = [];

    for (let i = 0; i < size; i++) {
        let cur = [];
        for (let j = 0; j < size; j++) {
            cur.push(0);
        }
        curTicTacToe.board.push(cur);
    }

    curTicTacToe.numToWin = num;
    if (curTicTacToe.numToWin < 1) {
        curTicTacToe.numToWin = 1;
    }

    curTicTacToe.moveCount = 0;
    curTicTacToe.curPlayer = 1;
    curTicTacToe.playable = true;

    postTicTacToeBoard(receivedMessage.channel);
    receivedMessage.channel.send("```" + getSymbolForTicTacToe(curTicTacToe.curPlayer) + " is up!```");

}

function playTicTacToe(receivedMessage, x, y) {

    if (!curTicTacToe.playable) {
        receivedMessage.channel.send("Start a new game to play!");
        return;
    }

    x--;
    y--;

    if (curTicTacToe.board[x][y] == 0) {

        curTicTacToe.moveCount++;
        curTicTacToe.board[x][y] = curTicTacToe.curPlayer;

        let winner = checkBoardForWin(x, y, curTicTacToe.board, curTicTacToe.curPlayer, curTicTacToe.moveCount, curTicTacToe.numToWin);

        if (winner == 0) {
            curTicTacToe.curPlayer = curTicTacToe.curPlayer == 1 ? 2 : 1;
            postTicTacToeBoard(receivedMessage.channel);
            receivedMessage.channel.send("```" + getSymbolForTicTacToe(curTicTacToe.curPlayer) + " is up!```");
        } else {

            postTicTacToeBoard(receivedMessage.channel);

            if (winner == 3) {
                curTicTacToe.playable = false;
                receivedMessage.channel.send("*Draw!*");
            } else {
                curTicTacToe.playable = false;
                receivedMessage.channel.send("```" + getSymbolForTicTacToe(curTicTacToe.curPlayer) + " wins!```");
            }

        }

    } else {
        receivedMessage.channel.send("Can't go there!");
    }

}

function postTicTacToeBoard(channel) {

    let res = '  ╔';

    for (let i = 0; i < curTicTacToe.board.length; i++) {
        res += "═══";
        if (i < curTicTacToe.board.length - 1) {
            res += "╦";
        }
    }

    res += "╗\n";

    for (let y = 0; y <= curTicTacToe.board.length; y++) {
        if (y != 0 && y != curTicTacToe.board.length) {
            res += "\n  ╠";
            for (let i = 0; i < curTicTacToe.board.length; i++) {
                res += "═══";
                if (i < curTicTacToe.board.length - 1) {
                    res += "╬";
                }
            }
            /*for (let i = 0; i < curTicTacToe.board.length - 1; i++) {
                res += "═";
            }*/
            res += "╣\n";
        }
        if (y < curTicTacToe.board.length) {
            res += (y + 1).toString() + " ║";
        }
        let row = curTicTacToe.board[y];
        if (row != undefined) {
            for (let x = 0; x < row.length; x++) {
                res += " " + getSymbolForTicTacToe(row[x]) + " " + (x != row.length - 1 ? "║" : "");
            }
            res += "║ ";
        } else {
            res += "\n  ╚";
            for (let i = 0; i < curTicTacToe.board.length; i++) {
                res += "═══";
                if (i < curTicTacToe.board.length - 1) {
                    res += "╩";
                }
            }
            res += "╝\n   ";
            for (let x = 0; x < curTicTacToe.board.length; x++) {
                res += " " + (x + 1).toString() + (x + 1 < 10 ? " " : "") + (x != curTicTacToe.board.length - 1 ? " " : "");
            }
        }

    }

    res += "\n";

    channel.send("```" + res + "```");

}

function getSymbolForTicTacToe(num) {

    let res = '';

    switch (num) {
        case 0:
            res = ' ';
            break;
        case 1:
            res = 'X';
            break;
        case 2:
            res = 'O';
            break;
    }

    return res;

}

function checkBoardForWin(x, y, board, player, moveCount, numToWin) {

    var n = board.length;
    var winner = 0;

    //check end conditions

    var curChain = 0;
    var longestChain = 0;

    //console.log("played at " + x.toString() + ", " + y.toString());

    //check col
    for (let i = 0; i < n; i++) {
        if (board[x][i] != player) {
            curChain = 0;
            continue;
        } else {
            curChain++;
            if (curChain > longestChain) {
                longestChain = curChain;
            }
        }
    }

    curChain = 0;

    //check row
    for (let i = 0; i < n; i++) {
        if (board[i][y] != player) {
            curChain = 0;
            continue;
        } else {
            curChain++;
            if (curChain > longestChain) {
                longestChain = curChain;
            }
        }
    }

    curChain = 0;

    let startX = x;
    let startY = y;

    let endX = x;
    let endY = y;

    if (x > y) {
        startX = x - y;
        startY = 0;
        endX = x + (n - x);
        endY = y + (n - x);
    } else {
        if (x == y) {
            startX = 0;
            startY = 0;
            endX = n;
            endY = n;
        } else {
            startX = 0;
            startY = y - x;
            endX = x + (n - y);
            endY = y + (n - y);
        }
    }

    //console.log("played at " + x.toString() + ", " + y.toString());
    //console.log("checking line: " + startX.toString() + ", " + startY.toString() + " to " + endX.toString() + ", " + endY.toString());

    for (let curX = startX, curY = startY; curX < endX; curX++ , curY++) {
        //console.log("checking diagonal: " + curX.toString() + ", " + curY.toString());
        if (board[curX][curY] != player) {
            //console.log("not player");
            curChain = 0;
            continue;
        } else {
            curChain++;
            //console.log("is player, chain: " + curChain);
            if (curChain > longestChain) {
                longestChain = curChain;
            }
        }
    }

    curChain = 0;

    startX = x;
    startY = y;

    endX = x;
    endY = y;

    if (x + y < n - 1) {
        startX = x + y;
        startY = 0;
    } else {
        if(x + y == n) {
            startX = n - 1;
            startY = 0;
        } else {
            startX = n - 1;
            startY = x + y - startX;
        }
    }

    endX = startY;
    endY = startX;

    console.log("played at " + x.toString() + ", " + y.toString());
    console.log("checking line: " + startX.toString() + ", " + startY.toString() + " to " + endX.toString() + ", " + endY.toString());

    for (let curX = startX, curY = startY; curX >= endX; curX-- , curY++) {
        console.log("checking anti-diagonal: " + curX.toString() + ", " + curY.toString());
        if (board[curX][curY] != player) {
            console.log("not player");
            curChain = 0;
            continue;
        } else {
            curChain++;
            console.log("is player, chain: " + curChain);
            if (curChain > longestChain) {
                longestChain = curChain;
            }
        }
    }

    curChain = 0;

    console.log("longest chain: " + longestChain);

    //check draw
    if (moveCount == (Math.pow(board.length, 2))) {
        winner = 3;
    }

    if (longestChain >= numToWin) {
        winner = player;
    }

    return winner;

}

module.exports = {
    startTicTacToeGame: startTicTacToeGame,
    playTicTacToe: playTicTacToe,
    startConnectFourGame: startConnectFourGame,
    playConnectFour: playConnectFour
};