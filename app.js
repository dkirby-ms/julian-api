// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

var express = require('express');
var app = express();
var request = require('request');
var morgan = require("morgan");
var passport = require("passport");
var config = require('./config.js')

var BearerStrategy = require('passport-azure-ad').BearerStrategy;

var bearerStrategy = new BearerStrategy(config.b2coptions,
    function (token, done) {
        // Send user info using the second argument
        done(null, {}, token);
    }
);

app.use(morgan('dev'));

app.use(passport.initialize());
passport.use(bearerStrategy);

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Authorization, Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.get("/hello", passport.authenticate('oauth-bearer', {session: false}),
    function (req, res) {
        var claims = req.authInfo;
        console.log('User info: ', req.user);
        console.log('Validated claims: ', claims);
        
        if (claims['scp'].split(" ").indexOf("Secrets.Read") >= 0) {
            // Service relies on the name claim.  
            res.status(200).json({'name': claims['name'], 'country': claims['country']});
        } else {
            console.log("Invalid Scope, 403");
            res.status(403).json({'error': 'insufficient_scope'}); 
        }
    }
);

app.get('/', function (req, res) {
    res.send('Hello from webapi in Covington!!');
});

// just here to easily demo read value from kv w pod managed identity
app.get('/b2cclientappid', function (req, res) {
    config.keyvaultClient.getSecret("b2c-clientappid").then(function (secret) {
        res.send(`Your secret value is: ${secret.value}.`);
    }).catch(function (err) {   
        res.send(err);   
    });
});

app.get('/b2cclientsecret', function (req, res) {
    config.keyvaultClient.getSecret("b2c-clientsecret").then(function (secret) {
        res.send(`Your secret value is: ${secret.value}.`);
    }).catch(function (err) {   
        res.send(err);   
    });
});

var port = 80;
var server = app.listen(port, function () {
    console.log('Listening on port ' + port);
});

process.on("SIGINT", () => {
    process.exit(130 /* 128 + SIGINT */);
});

process.on("SIGTERM", () => {
    console.log("Terminating...");
    server.close();
});