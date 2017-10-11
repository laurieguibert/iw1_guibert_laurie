/**
 * Created by lguib on 11/10/2017.
 */
var restify = require('restify');
var botbuilder = require ('botbuilder');
var cognitiveservices = require('botbuilder-cognitiveservices');

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
var bot = new botbuilder.UniversalBot(connector);

var recognizer = new cognitiveservices.QnAMakerRecognizer({
    knowledgeBaseId : 'bf35d51f-7d05-40af-afd8-84d4e5cf99fe',
    subscriptionKey : 'b15e91f1c0a447e4a9931faf002c0d4f'
});

var basicQnAMakerDialog = new cognitiveservices.QnAMakerDialog({
    recognizers : [recognizer],
    defaultMessage: "Pas de correspondance !",
    qnaThreshold: 0.3
});

bot.dialog('/', basicQnAMakerDialog);
