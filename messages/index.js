"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});

var bot = new builder.UniversalBot(connector);

var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })

.matches('Greeting', (session, args) => {
    session.send('Welcome to DJ SongBot! We can search or play music(coming soon)');
})


.matches('Search', (session, args) => {
    var result = args;
    var entityType = result.entities[0].type;
    var entity = result.entities[0].entity;
    var message;   
    
    
    if (entityType ==='Artist'){
      message = 'Searching for tracks by: '+ entity;   
    }else if (entityType ==='Genre'){
      message = 'Searching for '+ entity +' songs';
    }else if (entityType === 'Song') {
        message = 'Searching for Songs titles containing: '+ entity;
    }
    else {
        message = 'I was unable to feel the groove, please try again';
    }
        /*Soundcloud Api Doc -- https://developers.soundcloud.com/docs/api/
    generate the http.request to call soundcloud api here
    return results as a list of songs
    by concatenating '\n' + songs[i] in a loop*/
    //ADD when trained and parsed correctly
    //else if (entityType === 'Track') {
        //essage = 'Searching for the track: '+ entity;
    //}
    //else if (entityType === 'Song remix') {
        //essage = 'Searching for remix of: '+ entity;
    //}
    session.send(message);
})

.onDefault((session) => {
    session.send('I was unable to feel the groove, please try again. I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

