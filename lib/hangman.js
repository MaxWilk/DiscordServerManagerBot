const words = require('./words.json');
const alphabet = "abcdefghijklmnopqrstuvwxyz";

var curHangmanPuzzle = undefined;

function startHangmanGame(receivedMessage, guesses) {

    if(guesses < 1) {
        guesses = 1;
    }

    curHangmanPuzzle = {};

    curHangmanPuzzle.word = words[parseInt(Math.random() * words.length)];
    curHangmanPuzzle.unusedLetters = "abcdefghijklmnopqrstuvwxyz";
    curHangmanPuzzle.guessesLeft = guesses;
    curHangmanPuzzle.progress = getCurrentHangmanString().replace(' ', '');

    //console.log(curHangmanPuzzle.word.term);
    //console.log(curHangmanPuzzle.progress);

    receivedMessage.channel.send(curHangmanPuzzle.progress.toUpperCase() + "\n" + curHangmanPuzzle.guessesLeft + " *guesses left.*");

}

function hangmanGuess(guess, receivedMessage) {

    if (curHangmanPuzzle == undefined) {
        return;
    }

    if (curHangmanPuzzle.guessesLeft <= 0) {
        receivedMessage.channel.send("You lost! Word was *" + curHangmanPuzzle.word.term + "*.\nDefinition: " + curHangmanPuzzle.word.definition + ".");
        return;
    }

    if (!curHangmanPuzzle.unusedLetters.includes(guess) && guess.length == 1) {
        receivedMessage.channel.send("Already used that letter.");
        return;
    }

    //console.log(guess);

    if (!curHangmanPuzzle.word.term.includes(guess)) {
        curHangmanPuzzle.guessesLeft--;
    }

    if (curHangmanPuzzle.guessesLeft <= 0) {
        receivedMessage.channel.send("You lost! Word was *" + curHangmanPuzzle.word.term + "*.\nDefinition: " + curHangmanPuzzle.word.definition + ".");
        return;
    }

    if (guess.length == 1) {

        curHangmanPuzzle.unusedLetters = curHangmanPuzzle.unusedLetters.replace(guess, '');
        curHangmanPuzzle.progress = getCurrentHangmanString().replace(' ', '');

    } else {

        if (curHangmanPuzzle.word.term == guess) {
            curHangmanPuzzle.progress = curHangmanPuzzle.word.term;
        }

    }

    //console.log(curHangmanPuzzle.unusedLetters);
    //console.log(curHangmanPuzzle.progress);

    if (curHangmanPuzzle.progress.includes('-')) {
        receivedMessage.channel.send(curHangmanPuzzle.progress.toUpperCase() + "\n" + curHangmanPuzzle.guessesLeft + " *guesses left.*\n*Letters guessed:* " + getDifference(curHangmanPuzzle.unusedLetters, alphabet).split('').join(' ').toUpperCase() + ".");
    } else {
        receivedMessage.channel.send("Nice! You won! Word was: *" + curHangmanPuzzle.word.term + "*.\nDefinition: " + curHangmanPuzzle.word.definition + ".");
    }
}

function getCurrentHangmanString() {
    let res = "";

    let split = curHangmanPuzzle.word.term.split('');

    for (let letter of split) {
        if (curHangmanPuzzle.unusedLetters.includes(letter)) {
            res += " - ";
        } else {
            res += " " + letter + " ";
        }
    }

    return res;
}

function getDifference(a, b) {
    var i = 0;
    var j = 0;
    var result = "";

    while (j < b.length) {
        if (a[i] != b[j] || i == a.length)
            result += b[j];
        else
            i++;
        j++;
    }
    return result;
}

module.exports = {
    startHangmanGame: startHangmanGame,
    hangmanGuess: hangmanGuess
};