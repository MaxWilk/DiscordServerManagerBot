const dictChecker = require('./dictChecker.js');

const FreeWordLetters = "AAAFRSAAEEEEAAEEOOAAFIRSABDEIOADENNNAEEEEMAEEGMUAEGMNNAEILMNAEINOUAFIRSYANERHEINQUTHBBJKXZCCENSTCDDLNNCEIITTCEIPSTCFGNUYDDHNOTDHHLORDHHNOWDHLNOREHILRSEIILSTEILPSTEIOEMTTTOENSSSUGORRVWHIRSTVHOPRSTIPRSYYJKQUWXZNOOTUWOOOTTU";
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

var curFreeWordGame = undefined;

function getRandomString(length, characters, unique) {

    var charCopy = characters;
    var result = '';

    for (var i = 0; i < length; i++) {

        let ranIndex = Math.floor(Math.random() * charCopy.length);
        let nextLetter = charCopy.charAt(ranIndex);

        if (unique) {
            charCopy = charCopy.slice(0, ranIndex) + charCopy.slice(ranIndex + 1);
        }

        result += nextLetter;

    }

    return result;

}

function getDistribution(characters) {

    var obj = {};

    for (let i = 0; i < alphabet.length; i++) {

        var letter = alphabet.charAt(i);
        var re = new RegExp(letter, 'g');
        var match = characters.match(re);
        var count = 0;

        if (match != null && match != undefined) {
            count = match.length;
        }

        if (typeof (obj[letter]) !== undefined) {
            obj[letter] = count;
        } else {
            obj[letter] = count;
        }

    }

    return obj;

}

var savedMessage = undefined;

function startFreeWordGame(receivedMessage, size) {

    console.log("starting freeword");

    savedMessage = receivedMessage;

    if (size > 14) {
        size = 14;
    }

    curFreeWordGame = {};

    var letters = getRandomString(Math.pow(size, 2), FreeWordLetters, true);
    var slices = [];

    for (let i = 0; i < size; i++) {
        let curPush = letters.slice(0, size);
        let slice = [];
        for (let j = 0; j < curPush.length; j++) {
            slice.push(curPush.charAt(j));
        }

        slices.push(slice);
        letters = letters.substring(size, letters.length);
    }

    curFreeWordGame.board = slices;
    curFreeWordGame.active = true;
    curFreeWordGame.scores = {};
    curFreeWordGame.playedWords = [];
    curFreeWordGame.neighbors = {};

    for(let y = 0; y < size; y++) {
        for(let x = 0; x < size; x++) {
            let curCoord = {};
            curCoord.x = x;
            curCoord.y = y;
            curFreeWordGame.neighbors[JSON.stringify(curCoord)] = getNeighbs(curCoord, curFreeWordGame.board, true, undefined);
        }
    }

    postFreeWordBoard(receivedMessage.channel);

    if(curFreeWordGame.timer != undefined) {
        clearTimeout(curFreeWordGame.timer);
    }

    curFreeWordGame.timer = setTimeout(endFreeWordGame, 1000 * 60);

}

function endFreeWordGame() {

    if (savedMessage != undefined) {

        curFreeWordGame.active = false;

        let scoreString = '';
        for (let key in curFreeWordGame.scores) {
            scoreString += key + ": ";
            scoreString += curFreeWordGame.scores[key] + "\n";
        }
        savedMessage.channel.send("Game over!\n" + scoreString)

    }

}

function playFreeWordWord(receivedMessage, word) {

    if (!curFreeWordGame.active) {
        receivedMessage.channel.send("Start a new game to play.");
        return;
    }

    let messageSent = false;
    let valid = !curFreeWordGame.playedWords.includes(word.toLowerCase());

    if (valid) {
        valid = checkFreeWordPlay(word.toUpperCase());
    } else {
        if (!messageSent) {
            receivedMessage.channel.send("Word was already used!");
            messageSent = true;
        }
    }

    if (valid) {
        valid = dictChecker.checkWord(word.toLowerCase());
    } else {
        if (!messageSent) {
            receivedMessage.channel.send("Word is not on the board!");
            messageSent = true;
        }
    }

    if (!valid) {
        if (!messageSent) {
            receivedMessage.channel.send("That's not a valid word!");
            messageSent = true;
        }
    } else {

        curFreeWordGame.playedWords.push(word.toLowerCase());

        if (typeof (curFreeWordGame.scores[receivedMessage.member.displayName]) !== undefined) {
            let curScore = curFreeWordGame.scores[receivedMessage.member.displayName];
            //console.log("adding " + word.length + " to existing score");
            if (isNaN(curScore)) {
                curFreeWordGame.scores[receivedMessage.member.displayName] = word.length;
            } else {
                curFreeWordGame.scores[receivedMessage.member.displayName] += word.length
            }
            //console.log(curFreeWordGame.scores[receivedMessage.member.displayName]);
        } else {
            //console.log("making new score");
            curFreeWordGame.scores[receivedMessage.member.displayName] = word.length;
        }

    }

    postFreeWordBoard(receivedMessage.channel);

}

function checkFreeWordPlay(word) {

    let startChar = word.charAt(0);
    let allIndicesOfStart = getAllIndexes(curFreeWordGame.board, startChar);
    let valid = false;

    for (let i = 0; i < allIndicesOfStart.length; i++) {
        let coord = allIndicesOfStart[i];
        let curWordIterate = 1;
        if(startChar == 'Q' && word.charAt(1) == 'U') {
            curWordIterate = 2;
        }
        let curNext = word.charAt(curWordIterate);
        let curNeighbs = curFreeWordGame.neighbors[JSON.stringify(coord)]; //getNeighbs(coord, curFreeWordGame.board, true, undefined);
        let curMatchingNeighbs = neighborsContainValue(curNeighbs, curNext, curFreeWordGame.board);

        //console.log(curNext);
        //console.log(curNeighbs);
        //console.log(curMatchingNeighbs);

        while (curMatchingNeighbs.length > 0) {

            //console.log("evaluating " + curNext);
            //console.log(curMatchingNeighbs.length);

            if (curWordIterate == word.length - 1) {
                valid = true;
                break;
            }

            curWordIterate++;

            curNext = word.charAt(curWordIterate);
            curNeighbs = [];
            for(let k = 0; k < curMatchingNeighbs.length; k++) {
                let curCoord = curMatchingNeighbs[k];
                curNeighbs = curNeighbs.concat(curFreeWordGame.neighbors[JSON.stringify(curCoord)]);
            }
            curNeighbs = curNeighbs.filter(function(elem, index, self) {
                return index === self.indexOf(elem);
            });
            curMatchingNeighbs = neighborsContainValue(curNeighbs, curNext, curFreeWordGame.board);

        }

        if (valid) {
            break;
        }

    }

    return valid;

}

function neighborsContainValue(neighbs, val, arr) {

    var res = [];

    for (let i = 0; i < neighbs.length; i++) {
        let curValue = getValueAtCoord(neighbs[i], arr);
        //console.log("searching neighbs: " + curValue + ", matching to: " + val);
        if (curValue == val) {
            //console.log("matched");
            res.push(neighbs[i]);
        }
    }

    return res;

}

function getValueAtCoord(coord, arr) {
    return arr[coord.y][coord.x];
}

function getNeighbs(coords, arr, diagonal, exclude) {

    let coordsArray = [];

    if (!Array.isArray(coords)) {
        coordsArray = [coords];
    } else {
        coordsArray = coords;
    }

    var neighbs = [];

    for (let i = 0; i < coordsArray.length; i++) {

        let coord = coordsArray[i];

        let xC = coord.x;
        let yC = coord.y;

        if (xC - 1 >= 0) {

            let c = {};
            c.x = xC - 1;
            c.y = yC;
            if (exclude != undefined) {
                if (!exclude.includes(c)) {
                    neighbs.push(c);
                }
            } else {
                neighbs.push(c);
            }

            if (diagonal) {

                if (yC - 1 >= 0) {

                    let c1 = {};
                    c1.x = xC - 1;
                    c1.y = yC - 1;
                    if (exclude != undefined) {
                        if (!exclude.includes(c1)) {
                            neighbs.push(c1);
                        }
                    } else {
                        neighbs.push(c1);
                    }

                }

                if (yC + 1 < arr.length) {

                    let c1 = {};
                    c1.x = xC - 1;
                    c1.y = yC + 1;
                    if (exclude != undefined) {
                        if (!exclude.includes(c1)) {
                            neighbs.push(c1);
                        }
                    } else {
                        neighbs.push(c1);
                    }

                }

            }

        }

        if (xC + 1 < arr.length) {

            let c = {};
            c.x = xC + 1;
            c.y = yC;
            if (exclude != undefined) {
                if (!exclude.includes(c)) {
                    neighbs.push(c);
                }
            } else {
                neighbs.push(c);
            }

            if (diagonal) {

                if (yC - 1 >= 0) {

                    let c1 = {};
                    c1.x = xC + 1;
                    c1.y = yC - 1;
                    if (exclude != undefined) {
                        if (!exclude.includes(c1)) {
                            neighbs.push(c1);
                        }
                    } else {
                        neighbs.push(c1);
                    }

                }

                if (yC + 1 < arr.length) {

                    let c1 = {};
                    c1.x = xC + 1;
                    c1.y = yC + 1;
                    if (exclude != undefined) {
                        if (!exclude.includes(c1)) {
                            neighbs.push(c1);
                        }
                    } else {
                        neighbs.push(c1);
                    }

                }

            }

        }

        if (yC + 1 < arr.length) {

            let c = {};
            c.x = xC;
            c.y = yC + 1;
            if (exclude != undefined) {
                if (!exclude.includes(c)) {
                    neighbs.push(c);
                }
            } else {
                neighbs.push(c);
            }

        }

        if (yC - 1 >= 0) {

            let c = {};
            c.x = xC;
            c.y = yC - 1;
            if (exclude != undefined) {
                if (!exclude.includes(c)) {
                    neighbs.push(c);
                }
            } else {
                neighbs.push(c);
            }
        }

    }

    //console.log(neighbs);
    return neighbs;

}

function getAllIndexes(arr, val) {
    var indexes = [];
    for (let i = 0; i < arr.length; i++) {
        for (let j = 0; j < arr[i].length; j++) {
            if (arr[i][j] === val) {
                let coord = {};
                coord.x = j;
                coord.y = i;
                indexes.push(coord);
            }
        }
    }
    return indexes;
}

function postFreeWordBoard(channel) {

    var res = "";

    for (let i = 0; i < curFreeWordGame.board.length; i++) {

        let line = curFreeWordGame.board[i];

        for (let j = 0; j < line.length; j++) {
            res += line[j] + (line[j].toLowerCase() == 'q' ? "u  " : "   ");
        }

        if (i != curFreeWordGame.board.length - 1) {
            res += "\n\n";
        }

    }

    channel.send("```" + res + "```");
    //console.log(res);

}

module.exports = {
    startFreeWordGame: startFreeWordGame,
    playFreeWordWord: playFreeWordWord
};