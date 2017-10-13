/**
 * Created by lguib on 11/10/2017.
 */
var restify = require('restify');
var botbuilder = require ('botbuilder');

// setup restify server

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3987, function(){
    console.log('%s bot started at %s', server.name, server.url);
});

// create chat connector
var connector = new botbuilder.ChatConnector({
    appId: process.env.APP_ID,
    appPassword: process.env.APP_SECRET
});

// Listening for user inputs
server.post('/api/messages', connector.listen());

// Reply by echoing
var bot = new botbuilder.UniversalBot(connector, [
    function(session){
        session.send("Bienvenue dans le bot de gestion des alarmes.");
        session.beginDialog('alarme:menu');
    }
]);

bot.library(require('./dialogs/alarm.js'));
