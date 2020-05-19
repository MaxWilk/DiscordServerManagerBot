/*const fs = require('fs');

var objs = [];

const storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
        console.error(err)
    }
}

function convertToJSON() {
    var lineReader = require('readline').createInterface({
        input: require('fs').createReadStream('./scrabble.txt')
    });

    lineReader.on('line', function (line) {
        objs.push(line.toLowerCase());
    });

    lineReader.on('close', () => storeData(objs, './scrabbleWords.json'));

}

convertToJSON();*/

const words = require('./scrabbleWords.json');

function checkWord(word) {
    if(words.includes(word)) {
        return true;
    } else {
        return false;
    }
}

module.exports = {
    checkWord: checkWord
}