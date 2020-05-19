var Twitter = require('twitter');

var _consumer_key = ''
var _consumer_secret = ''
var _access_token_key = ''
var _access_token_secret = ''

try {

    var data = fs.readFileSync('settings.cfg', 'utf8');
    var dataStr = data.toString();

    var lines = data.split('\n');

    _consumer_key = getValueFromSettingsLine(lines[1]);
    _consumer_secret = getValueFromSettingsLine(lines[2]);
    _access_token_key = getValueFromSettingsLine(lines[3]);
    _access_token_secret = getValueFromSettingsLine(lines[4]);

} catch (e) {

    console.log('Error:', e.stack);

}

function getValueFromSettingsLine(line) {
    var rightOfEquals = line.split('=')[1];
    return rightOfEquals.replace(/\s/g, '');
}

var twitter = new Twitter({
    consumer_key: _consumer_key,
    consumer_secret: _consumer_secret,
    access_token_key: _access_token_key,
    access_token_secret: _access_token_secret
});

const twitterChannelName = "twitter_bot";

var twitterChannel = undefined;

function checkTwitterKeys() {

    return !(twitter.consumer_key.includes("[INSERT") || twitter.consumer_secret.includes("[INSERT") || twitter.access_token_key.includes("[INSERT") || twitter.access_token_secret.includes("[INSERT"));

}

function postFavTweets(server, number, channel) {

    twitterChannel = server.channels.find('name', twitterChannelName);

    if (twitterChannel == undefined) {
        return;
    }

    let topic = twitterChannel.topic;

    if (topic.includes(':')) {
        topic = topic.split(':')[0];
    }

    if (topic.includes(',')) {

        let handles = topic.split(',');

        for (let i = 0; i < handles.length; i++) {
            postTweets(handles[i], number, channel);
        }

    } else {
        postTweets(topic, number, channel);
    }

}

function postTweets(un, number, channel) {

    var params = { screen_name: un, count: number };
    twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
        if (!error) {
            for (let tweet of tweets) {
                let url = 'https://twitter.com/' + un + '/status/' + tweet.id_str;
                channel.send(url);
            }
        }
    });

}

function refreshTwitterChannel(server) {

    if (server == null || server == undefined) {
        console.log("server undf");
        return;
    }

    twitterChannel = server.channels.find('name', twitterChannelName);

    if (twitterChannel == undefined) {

        console.log("tch undef");
        return;

    } else {

        if (twitterChannel.topic.includes(":")) {

            let twitterUpdates = twitterChannel.topic.split(':')[1] == "update";

            if (twitterUpdates) {

                twitterChannel.fetchMessages().then(messages =>
                    processMessages(messages)
                );

                function processMessages(messages) {

                    let strippedMessages = [];

                    messages.forEach(message => {
                        strippedMessages.push(message.content);
                    });

                    let topic = twitterChannel.topic;

                    if (topic.includes(':')) {
                        topic = topic.split(':')[0];
                    }

                    if (topic.includes(',')) {

                        let handles = topic.split(',');

                        for (let i = 0; i < handles.length; i++) {
                            postTweetsToBotChannel(server, handles[i], 1, strippedMessages);
                        }

                    } else {
                        postTweetsToBotChannel(server, topic, 1, strippedMessages);
                    }

                }

            }

        }

    }

}

function postTweetsToBotChannel(server, un, number, messages) {

    twitterChannel = server.channels.find('name', twitterChannelName);

    if (twitterChannel == undefined) {

        async function makeNewChannel() {
            const createdChannel = await server.createChannel(twitterChannelName, "text");
            const top = await createdChannel.setTopic(":quiet");

            var params = { screen_name: un, count: number };
            const t = await twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
                if (!error) {
                    for (let tweet of tweets) {
                        let url = 'https://twitter.com/' + un + '/status/' + tweet.id_str;
                        if (!messages.includes(url)) {
                            createdChannel.send(url);
                        }
                    }
                }
            });

        }

        makeNewChannel();

    } else {

        var params = { screen_name: un, count: number };
        twitter.get('statuses/user_timeline', params, function (error, tweets, response) {
            if (!error) {
                for (let tweet of tweets) {
                    let url = 'https://twitter.com/' + un + '/status/' + tweet.id_str;
                    if (!messages.includes(url)) {
                        twitterChannel.send(url);
                    }
                }
            }
        });

    }

}

function alterTwitterUpdates(start, server) {

    if (start) {

        twitterChannel = server.channels.find('name', twitterChannelName);

        if (twitterChannel == undefined) {

            async function makeNewChannel() {
                const createdChannel = await server.createChannel(twitterChannelName, "text");
                const top = await createdChannel.setTopic(":update");
                createdChannel.send("I'll start sending new tweets to here.");
                twitterChannel = createdChannel;
            }

            makeNewChannel();

        } else {

            if (twitterChannel.topic.split(':')[1] != "update") {

                twitterChannel.send("I'll start sending new tweets to here.");

                let curTop = twitterChannel.topic;

                if (!curTop.includes(':')) {
                    curTop += ":quiet";
                }

                let topSplit = curTop.split(':');
                let newTop = topSplit[0] + ":update";

                twitterChannel.setTopic(newTop);

            } else {

                twitterChannel.send("Already updating!");

            }

        }

    } else {

        twitterChannel = server.channels.find('name', twitterChannelName);

        if (twitterChannel == undefined) {
            return;
        }

        if (twitterChannel.topic.split(':')[1] != "quiet") {

            twitterChannel.send("I'll stop updating tweets.");

            let curTop = twitterChannel.topic;

            if (!curTop.includes(':')) {
                curTop += ":quiet";
            }

            let topSplit = curTop.split(':');
            let newTop = topSplit[0] + ":quiet";

            twitterChannel.setTopic(newTop);

        } else {

            twitterChannel.send("I'm not logging at the moment.");

        }

    }

}

module.exports = {
    postFavTweets: postFavTweets,
    postTweets: postTweets,
    alterTwitterUpdates: alterTwitterUpdates,
    refreshTwitterChannel: refreshTwitterChannel,
    checkTwitterKeys: checkTwitterKeys
};