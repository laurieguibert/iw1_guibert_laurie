/**
 * Created by lguib on 10/10/2017.
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
        session.beginDialog('getUser', session.userData.profile);
    },
    function(session, results){
        session.userData.profile = results.response;
        session.send(`Procédons maintenant à la réservation ${session.userData.profile.firstname} ${session.userData.profile.name} `);
        session.beginDialog('getResa');
    }
]);

bot.dialog('getUser', [
    function (session, args, next){
        session.dialogData.profile = args || {};
        if(!session.dialogData.profile.name){
            botbuilder.Prompts.text(session,"Bonjour, quel est votre nom ?");
        } else {
            next();
        }
    }, 
    function (session, results, next){
        if(results.response){
            session.dialogData.profile.name = results.response;
        }

        if(!session.dialogData.profile.firstname){
            botbuilder.Prompts.text(session,"Et quel est votre prénom ?");
        } else {
            next();
        }
    },
    function (session, results){
        if(results.response){
            session.dialogData.profile.firstname = results.response;
        }

        session.endDialogWithResult({ response: session.dialogData.profile });

        //session.endDialog(`Bonjour ${session.dialogData.profile.firstname} ${session.dialogData.profile.name}`);
    }
]);

bot.dialog('getResa', [
    function (session){
        botbuilder.Prompts.time(session,"Pour quand souhaitez-vous réserver ?");
    }, 
    function (session, results, next){
        if(results.response){
            session.dialogData.date = botbuilder.EntityRecognizer.resolveTime([results.response]);
        }
        
        botbuilder.Prompts.text(session,"Pour combien de personnes souhaitez-vous réserver ?");
    },
    function (session, results){
        if(results.response){
            session.dialogData.participant = results.response;
        }

        botbuilder.Prompts.text(session,"A quel nom souhaitez-vous réserver votre table ?");
    },
    function (session, results, next){
        if(results.response){
            session.dialogData.reservationName = results.response;
        }
        
        session.send(`Votre réservation est confirmée pour le ${session.dialogData.date} pour ${session.dialogData.participant} personne(s) au nom de ${session.dialogData.reservationName}`);
        session.endDialog();
        session.endConversation();
    },
]).endConversationAction(
    "endOrderDinner", "Votre annulation a été prise en compte",
    {
        matches: /^cancel$|^goodbye$/i,
        confirmPrompt: "Souhaitez-vous vraiment annuler votre commande ?"
    }
);
