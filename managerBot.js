const Discord = require('discord.js');
const client = new Discord.Client();

const twitterStuff = require('./lib/twitterStuff.js');
const gridGames = require('./lib/gridGames.js');
const hangman = require('./lib/hangman.js');
const wordGames = require('./lib/wordGames.js');

const logChannelName = "botlog";
const twitterChannelName = "twitter_bot";
const tweetPullCap = 5;
const twitterUpdateRefreshInterval = 5;

var logChannel = undefined;
var twitterChannel = undefined;

var server;

client.on('ready', () => {
    console.log("Connected as " + client.user.tag);
});

client.on('voiceStateUpdate', (oldMember, newMember) => {

    let newUserChannel = newMember.voiceChannel;
    let oldUserChannel = oldMember.voiceChannel;

    if (oldUserChannel === undefined && newUserChannel !== undefined) {

        let server = newUserChannel.guild;

        // User Joins a voice channel
        tryLog(newMember.displayName + " joined " + newUserChannel.name + ".", server);

    } else if (newUserChannel === undefined) {

        let server = oldUserChannel.guild;

        // User leaves a voice channel
        tryLog(oldMember.displayName + " left " + oldUserChannel.name + ".", server);

    } else if (newUserChannel != undefined && oldUserChannel != undefined) {

        let server = oldUserChannel.guild;

        // User switches voice channels
        tryLog(oldMember.displayName + " switched from " + oldUserChannel.name + " to " + newUserChannel.name + ".", server);

    }

});

client.on('message', (receivedMessage) => {

    server = receivedMessage.guild;

    // Prevent bot from responding to its own messages
    if (receivedMessage.author == client.user) {
        return;
    }

    if (receivedMessage.channel.name.toLowerCase() == logChannelName) {
        receivedMessage.delete();
        return;
    }

    if (receivedMessage.channel.name.toLowerCase() == twitterChannelName) {
        receivedMessage.delete();
        return;
    }

    if (!receivedMessage.content.includes("!#")) {
        return;
    }

    var msgContent = receivedMessage.content.replace("!#", "").toLowerCase();

    if (twitterStuff.checkTwitterKeys) {

        if (msgContent.includes("get_tweet")) {

            if (msgContent.includes(':')) {

                var split = msgContent.split(':');

                if (split.length == 2) {
                    try {
                        let un = split[1];
                        twitterStuff.postTweets(un, 1, receivedMessage.channel);
                    } catch (e) {
                        console.log(e);
                    }
                } else {
                    try {
                        let un = split[1];
                        let num = parseInt(split[2]);

                        if (num > tweetPullCap) {
                            num = tweetPullCap;
                        }

                        twitterStuff.postTweets(un, num, receivedMessage.channel);
                    } catch (e) {
                        console.log(e);
                    }
                }

            } else {

                receivedMessage.channel.send("Say *get_tweet:(username):[optional](number)* to get a specific user's tweets.");

            }
            return;
        }

        if (msgContent.includes("twitter_handles")) {

            twitterChannel = server.channels.find('name', twitterChannelName);

            if (msgContent.includes(':')) {

                var split = msgContent.split(':');
                let uns = split[1];

                if (twitterChannel == undefined) {

                    async function makeNewChannel() {
                        const createdChannel = await server.createChannel(twitterChannelName, "text");
                        const top = await createdChannel.setTopic(uns + ":quiet");
                    }

                    makeNewChannel();

                } else {

                    let curTop = twitterChannel.topic;

                    if (!curTop.includes(':')) {
                        curTop += ":quiet";
                    }

                    let topSplit = curTop.split(':');
                    let newTop = uns + ":" + topSplit[1];

                    twitterChannel.setTopic(newTop);

                }

            } else {

                twitterChannel = server.channels.find('name', twitterChannelName);

                if (twitterChannel == undefined) {
                    receivedMessage.channel.send("Say *twitter_handles:(usernames separated by commas)* to set.");
                    return;
                }

                let top = twitterChannel.topic;

                if (top == undefined || top == "") {

                    receivedMessage.channel.send("Say *twitter_handles:(usernames separated by commas)* to set.");

                } else {

                    if (top.includes(':')) {

                        let handles = top.split(':')[0];

                        if (handles.includes(',')) {
                            handles = handles.replace(',', ", ");
                        }

                        if (handles == "" || handles == undefined) {
                            handles = "*empty*";
                        }

                        receivedMessage.channel.send(handles);

                    } else {

                        twitterChannel.setTopic(top + ":quiet");
                        receivedMessage.channel.send(top);

                    }

                }

            }

            return;

        }

        if (msgContent.includes("favorite_tweets")) {
            if (msgContent.includes(':')) {
                try {
                    let num = parseInt(msgContent.split(':')[1]);

                    if (num > tweetPullCap) {
                        num = tweetPullCap;
                    }

                    twitterStuff.postFavTweets(server, num, receivedMessage.channel);
                } catch (e) {
                    console.log(e);
                }
            } else {
                twitterStuff.postFavTweets(server, 1, receivedMessage.channel);
            }
            return;
        }

    } else {

        receivedMessage.channel.send("Please configure your Twitter keys in the settings.cfg file and restart the bot to use this feature.");

    }

    if (msgContent.includes("roll")) {

        if (msgContent.includes(':')) {

            let diceData = msgContent.split(':')[1];

            if (diceData.includes('d')) {

                let split = diceData.split('d');

                if (split.length == 2) {

                    try {

                        let num = parseInt(split[0]);
                        let sides = parseInt(split[1]);
                        rollDice(receivedMessage, num, sides);

                    } catch (e) {

                        console.log(e);

                    }

                }

            }

        }

        return;

    }

    if (msgContent.includes("ttt")) {

        if (!msgContent.includes("new")) {

            if (msgContent.includes(':')) {
                let split = msgContent.split(':');

                if (split.length == 2) {
                    let move = split[1];

                    if (move.includes(',')) {
                        let moveSplit = move.split(',');

                        try {
                            let x = parseInt(moveSplit[0]);
                            let y = parseInt(moveSplit[1]);
                            gridGames.playTicTacToe(receivedMessage, y, x);
                        } catch (e) {
                            console.log(e);
                        }
                    }

                } else {
                    receivedMessage.channel.send("Say *ttt:(row),(column)* to make a move at position (row),(column).")
                }

                return;
            }

        } else {

            if (msgContent.includes(':')) {

                try {

                    let configSplit = msgContent.split(':');

                    if (configSplit.length == 2) {
                        let size = parseInt(configSplit[1]);
                        gridGames.startTicTacToeGame(receivedMessage, size, size);
                    } else if (configSplit.length == 3) {
                        let size = parseInt(configSplit[1]);
                        let numToWin = parseInt(configSplit[2]);
                        gridGames.startTicTacToeGame(receivedMessage, size, numToWin);
                    }

                } catch (e) {
                    console.log(e);
                }

            } else {
                gridGames.startTicTacToeGame(receivedMessage, 3, 3);
            }

            return;

        }

    }

    if (msgContent.includes("cf")) {

        if (!msgContent.includes("new")) {

            if (msgContent.includes(':')) {
                let split = msgContent.split(':');

                if (split.length == 2) {
                    let move = split[1];

                    //if (move.includes(',')) {
                    //    let moveSplit = move.split(',');

                    try {
                        let x = parseInt(move);
                        //let y = parseInt(moveSplit[1]);
                        gridGames.playConnectFour(receivedMessage, x);
                    } catch (e) {
                        console.log(e);
                    }
                    //}

                } else {
                    receivedMessage.channel.send("Say *cf:(column)* to make a move at position (column).")
                }

                return;
            }

        } else {

            if (msgContent.includes(':')) {

                try {

                    let configSplit = msgContent.split(':');

                    if (configSplit.length == 2) {
                        let size = parseInt(configSplit[1]);
                        gridGames.startConnectFourGame(receivedMessage, size, 4);
                    } else if (configSplit.length == 3) {
                        let size = parseInt(configSplit[1]);
                        let numToWin = parseInt(configSplit[2]);
                        gridGames.startConnectFourGame(receivedMessage, size, numToWin);
                    }

                } catch (e) {
                    console.log(e);
                }

            } else {
                gridGames.startConnectFourGame(receivedMessage, 5, 4);
            }

            return;

        }

    }

    if (msgContent.includes("freeword")) {

        if (!msgContent.includes("new")) {

            if (msgContent.includes(':')) {
                let split = msgContent.split(':');

                if (split.length == 2) {
                    let move = split[1];

                    wordGames.playFreeWordWord(receivedMessage, move);

                } else {
                    receivedMessage.channel.send("Say *freeword:(word)* to play a word.")
                }

                return;
            }

        } else {

            if (msgContent.includes(':')) {

                try {

                    let configSplit = msgContent.split(':');

                    if (configSplit.length == 2) {
                        let size = parseInt(configSplit[1]);
                        wordGames.startFreeWordGame(receivedMessage, size);
                    }

                } catch (e) {
                    console.log(e);
                }

            } else {
                wordGames.startFreeWordGame(receivedMessage, 4);
            }

            return;

        }

    }

    if (msgContent.includes("hangman")) {

        if (!msgContent.includes("new")) {

            if (msgContent.includes(':')) {
                let split = msgContent.split(':');

                if (split.length == 2) {
                    let guess = split[1];
                    hangman.hangmanGuess(guess, receivedMessage);
                } else {
                    receivedMessage.channel.send("Say *hangman:(letter/word)* to make a guess of (letter/word).")
                }

                return;
            }

        } else {

            if (msgContent.includes(':')) {

                try {

                    let configSplit = msgContent.split(':');

                    if (configSplit.length == 2) {
                        let guesses = parseInt(configSplit[1]);
                        hangman.startHangmanGame(receivedMessage, guesses);
                    }

                } catch (e) {
                    console.log(e);
                }

            } else {
                hangman.startHangmanGame(receivedMessage, 5);
            }

            return;

        }

    }

    switch (msgContent) {

        case "help":
        case "commands":
            console.log("sending help");
            receivedMessage.channel.send("Prefix all commands with !# so I know you're talking to me.\n\n" +
                "---CHANNEL COMMANDS---\n" +
                "*nuke* - destroys a channel and recreates an identical empty one in its place.\n\n" +
                "---LOGGING---\n" +
                "*start_logging* - starts logging. Will log all channel changes and commands called to the #" + logChannelName + " channel.\n" +
                "*stop_logging* - stops logging.\n" +
                "*clear_log* - clears the log.\n\n" +
                "---GAME COMMANDS---\n" +
                "*roll:(#)d(sides)* - rolls (#) (sides)-sided dice.\n" +
                "*new_hangman:(# of guesses)* - starts a new game of hangman in which you get (# of guesses) guesses.\n" +
                "*hangman:(letter/word)* - guesses (letter/word) in the current game of hangman.\n" +
                "*new_ttt:[optional](grid size):[optional](number to win)* - starts a new game of tic tac toe with a (grid size) x (grid size) grid. Default is 3. First to get (number to win) in a row wins. Default is (grid size).\n" +
                "*ttt:(column),(row)* - places either x or o on the tic tac toe board at (column, row).\n" +
                "*new_cf:[optional](grid size):[optional](number to win)* - starts a new game of connect four with a (grid size) x (grid size) grid. Default is 3. First to get (number to win) in a row wins. Default is (grid size).\n" +
                "*cf:(column)* - drops the current player's piece in column (column).\n" +
                "*new_freeword:[optional](grid size)* - starts a new game of FreeWord with a (grid size) x (grid size) grid. Default is 4.\n" +
                "*freeword:(word)* - play a FreeWord word in an active game.\n\n" +
                "---TWITTER COMMANDS---\n" +
                "*get_tweet:(username):[optional](number)* - gets the (number) most recent tweets from (username).\n" +
                "*favorite_tweets:[optional](number)* - gets the (number) most recent tweets from all saved handles.\n" +
                "*twitter_handles:(usernames)* - sets/saves twitter handles. Separate with commas.\n" +
                "*twitter_handles* - gets saved twitter handles.\n" +
                "*twitter_update_start* - sends new tweets from saved handles to the #" + twitterChannelName + " channel.\n" +
                "*twitter_update_stop* - stops sending new tweets to the #" + twitterChannelName + " channel.\n" +
                "*twitter_update_clear* - clears #" + twitterChannelName + ".");
            break;

        case "start_logging":
            console.log("starting logging");
            alterLogging(true, server);
            break;

        case "stop_logging":
            console.log("stopping logging");
            alterLogging(false, server);
            break;

        case "twitter_update_start":
            if (twitterStuff.checkTwitterKeys) {
                console.log("starting twitter updates");
                twitterStuff.alterTwitterUpdates(true, server);
            } else {
                receivedMessage.channel.send("Please configure your Twitter keys in the settings.cfg file and restart the bot to use this feature.");
            }
            break;

        case "twitter_update_stop":
            if (twitterStuff.checkTwitterKeys) {
                console.log("stopping twitter updates");
                twitterStuff.alterTwitterUpdates(false, server);
            } else {
                receivedMessage.channel.send("Please configure your Twitter keys in the settings.cfg file and restart the bot to use this feature.");
            }
            break;

        case "twitter_update_clear":
            if (twitterStuff.checkTwitterKeys) {
                console.log("clearing twitter channel");
                nuke(receivedMessage, server, twitterChannelName);
            } else {
                receivedMessage.channel.send("Please configure your Twitter keys in the settings.cfg file and restart the bot to use this feature.");
            }
            break;

        case "new_ttt":
            console.log("starting tic tac toe game");
            gridGames.startTicTacToeGame(receivedMessage);
            break;

        case "clear_log":
            console.log("clearing log");
            nuke(receivedMessage, server, logChannelName);
            break;

        case "nuke":
            console.log("nuking " + receivedMessage.channel.name);
            nuke(receivedMessage, server);
            break;

        case "test":

            break;

        case "good_bot":
        case "goodbot":
            receivedMessage.channel.send("Thanks! :smiley: :heart:");
            break;

        default:
            console.log("not a command...");
            receivedMessage.channel.send("That's not a command. Enter a valid command, please.");
            break;

    }

});

setInterval(callTwitterRefresh, 1000 * 60 * twitterUpdateRefreshInterval);

function callTwitterRefresh() {
    if (twitterStuff.checkTwitterKeys) {
        twitterStuff.refreshTwitterChannel(server);
    }
}

function rollDice(receivedMessage, number, sides) {

    if (sides <= 0) {
        receivedMessage.channel.send("You've entered an impossible dice configuration.");
        return;
    }

    let result = "";
    let total = 0;

    for (let i = 0; i < number; i++) {

        let roll = Math.floor(Math.random() * sides) + 1;
        total += roll;
        result += roll.toString();

        if (i < number - 1) {
            result += ', ';
        }

    }

    receivedMessage.channel.send("Rolls: " + result + "\nTotal: " + total);

}

function alterLogging(start, server) {

    if (start) {

        logChannel = server.channels.find('name', logChannelName);

        if (logChannel == undefined) {

            async function makeNewChannel() {
                const createdChannel = await server.createChannel(logChannelName, "text");
                const top = await createdChannel.setTopic("logging");
                createdChannel.send("I'll start logging activity in here.");
                logChannel = createdChannel;
            }

            makeNewChannel();

        } else {

            if (logChannel.topic != "logging") {
                logChannel.send("I'll start logging activity in here.");
                logChannel.setTopic("logging");
            } else {
                logChannel.send("Already logging!");
            }

        }

    } else {

        logChannel = server.channels.find('name', logChannelName);

        if (logChannel == undefined) {
            return;
        }

        if (logChannel.topic == "logging") {
            logChannel.send("I'll stop logging activity in here.");
            logChannel.setTopic("");
        } else {
            logChannel.send("I'm not logging at the moment.");
        }

    }

}

function tryLog(message, server) {

    logChannel = server.channels.find('name', logChannelName);

    if (logChannel != undefined) {
        if (logChannel.topic == "logging") {
            logChannel.send(message);
        }
    }

}

function nuke(receivedMessage, server, specificChannel) {

    if (!receivedMessage.member.hasPermission("MANAGE_CHANNELS")) {
        receivedMessage.channel.send("You don't have permission to do that!");
        return;
    }

    var oldChannel = receivedMessage.channel;

    if (specificChannel != undefined && specificChannel != "") {
        oldChannel = server.channels.find('name', specificChannel);
    }

    if (oldChannel == undefined) {
        return;
    }

    oldChannel.delete();

    async function makeNewChannel() {
        const newChannel = await server.createChannel(oldChannel.name, oldChannel.type, oldChannel.permissionOverwrites);
        const par = await newChannel.setParent(oldChannel.parent);
        const pos = await newChannel.setPosition(oldChannel.position);
        const top = await newChannel.setTopic(oldChannel.topic);
        const nsf = await newChannel.setNSFW(oldChannel.nsfw);
    }

    tryLog(receivedMessage.member.displayName + " nuked " + oldChannel.name + "!", server);

    makeNewChannel();
}

var bot_secret_token = ""

try {

    var data = fs.readFileSync('settings.cfg', 'utf8');
    var dataStr = data.toString();

    var lines = data.split('\n');

    bot_secret_token = getValueFromSettingsLine(lines[0]);

} catch (e) {

    console.log('Error:', e.stack);

}

function getValueFromSettingsLine(line) {
    var rightOfEquals = line.split('=')[1];
    return rightOfEquals.replace(/\s/g, '');
}

// Get your bot's secret token from:
// https://discordapp.com/developers/applications/
// Click on your application -> Bot -> Token -> "Click to Reveal Token"

if (bot_secret_token.includes("[INSERT")) {
    console.log("Please configure your keys and tokens in the settings.cfg file and then restart to use this bot.")
}

client.login(bot_secret_token);