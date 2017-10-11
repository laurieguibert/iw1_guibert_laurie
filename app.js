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
        session.beginDialog('getUser', session.userData.profile);
    },
    function(session, results){
        session.userData.profile = results.response;
        session.send(`Procédons maintenant à la réservation ${session.userData.profile.firstname} ${session.userData.profile.name} `);
        session.beginDialog('reservation:hotel');
    },
    function(session, results){
        session.userData.reservation = results.response;
        var date = new Date(session.userData.reservation.reservationDate).toLocaleString("fr-FR");
        session.send(`Votre réservation est confirmée pour le ${date} pour ${session.userData.reservation.nbNight} nuit(s) à ${session.userData.reservation.destination.name} au nom de ${session.userData.profile.firstname} ${session.userData.profile.name} (${session.userData.profile.age} ans). <br/> Un email de confirmation vous sera envoyé à l'adresse suivante : ${session.userData.profile.email}`);
        session.endConversation();
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
    function (session, results, next){
        if(results.response){
            session.dialogData.profile.firstname = results.response;
        }

        if(!session.dialogData.profile.age){
            botbuilder.Prompts.number(session,"Et quel est votre âge ?");
        } else {
            next();
        }
    },
    function (session, results, next){
        if(results.response){
            session.dialogData.profile.age = results.response;
        }

        if(!session.dialogData.profile.email){
            botbuilder.Prompts.text(session,"Quel est votre adresse email ?");
        } else {
            next();
        }
    },
    function (session, results){
        if(results.response){
            session.dialogData.profile.email = results.response;
        }

        session.endDialogWithResult({ response: session.dialogData.profile });

        //session.endDialog(`Bonjour ${session.dialogData.profile.firstname} ${session.dialogData.profile.name}`);
    }
]);

bot.library(require('./dialogs/hotels.js'));
