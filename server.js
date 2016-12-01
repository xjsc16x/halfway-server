/* Author - Justin Charron, Mike LoTurco, Tiffany Leung, Josh Desmond
   heroku app can be found at halfway-server.herokuapp.com */

var express = require('express');
var path = require('path');
var fs = require('fs');
//var firebase = require('firebase');
var admin = require('firebase-admin');
var http = require('http');
var bodyParser = require('body-parser');
var favicon = require('serve-favicon');

admin.initializeApp({
  credential: admin.credential.cert("halfway-38ea3-firebase-adminsdk-w5kil-56a1d54347.json"),
  databaseURL: "https://halfway-38ea3.firebaseio.com"
});

var auth = admin.auth();
var db = admin.database();

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'public','photos','favicon.ico'))); 

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// using this later to verify that groupid 
// exists
app.param('groupid', function(req, res, next, groupid) {
	// do validation that groupid exists 

	// test
	var modified = groupid + '-0';

	req.groupid = modified; 

	next();
});

// example on get request
app.get('/api/placeids/:groupid', function(req, res) {
	res.json({groupid: req.groupid});
});

// example on post request
app.post('/api/groupid/add', function(req, res) {
	var id = req.body.id;
	addGroupId(id);
	res.json({groupid: id});
	res.end();
});

// example on put request
app.put('/api/groupid/update/', function(req, res) {
	var id = req.body.id;
	var newid = req.body.newid;
	updateGroupId(id, newid);
	res.json({groupid: newid});
	res.end();
});

// example on how to add data
function addGroupId(groupid) {
	db.ref('groups/' + groupid).set({
		id: groupid
	});
}

// example on how to update data
function updateGroupId(groupid, newid) {
	var updates = {}
	updates['groups/'+groupid] = newid;
	db.ref().update(updates);
}

app.listen(port, function() {
  console.log('App is listening on port ' + port);
});
