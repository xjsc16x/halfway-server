/* Author - Justin Charron, Mike LoTurco, Tiffany Leung, Josh Desmond
   heroku app can be found at halfway-server.herokuapp.com */

var express = require('express');
var path = require('path');
var fs = require('fs');
//var firebase = require('firebase');
var admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert("halfway-38ea3-firebase-adminsdk-w5kil-56a1d54347.json"),
  databaseURL: "https://halfway-38ea3.firebaseio.com"
});

var auth = admin.auth();
var database = admin.database();

var app = express();
var port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, '/public')));



app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.listen(port, function() {
  console.log('App is listening on port ' + port);
});
