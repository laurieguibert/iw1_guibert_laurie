/**
 * Created by lguib on 04/11/2017.
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


var bot = new botbuilder.UniversalBot(connector, 
    function(session) {
        session.send("Pending waterfall ...");
    }
);

// intégration de Luis
var luisEndpoint = "https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/24bea1f2-e983-444e-a4df-0e7b1550e9e7?subscription-key=f719bb9a24e9498eab3e9156b41acdb5&verbose=true&timezoneOffset=0"
var luisRecognizer = new botbuilder.LuisRecognizer(luisEndpoint);
bot.recognizer(luisRecognizer);

bot.dialog('Weather', [
    function(session, args, next){
        var intent = args.intent;
        console.log(intent.intent);
        if(intent.intent === 'Weather.GetCondition' || intent.intent === 'Weather.GetForecast'){
            var location = botbuilder.EntityRecognizer.findEntity(intent.entities, 'Weather.Location');
        }
        
        if(intent.intent === 'Weather.GetCondition'){
            session.send(`il fait vraiment beau à ${location.entity}`);
        } else if(intent.intent === 'Weather.GetForecast'){
            session.send(`il ne fait pas vraiment beau à ${location.entity}`);
        }
    }
]).triggerAction({
    matches : ["Weather.GetCondition", "Weather.GetForecast"]
}).cancelAction('CancelWeather', 'request canceled !', {
    matches : /^(cancel|abandon)/i,
    confirmPrompt:'Are you sure ?'
})
