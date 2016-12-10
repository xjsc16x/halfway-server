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
var geolib = require('geolib');
var googleMapsClient = require('@google/maps').createClient({
  key: 'AIzaSyD8FQs_RIIqG_wESVzpWIyc5j6NQf4UvQs'
});

admin.initializeApp({
  credential: admin.credential.cert("halfway-38ea3-firebase-adminsdk-w5kil-56a1d54347.json"),
  databaseURL: "https://halfway-38ea3.firebaseio.com"
});

var auth = admin.auth();
var db = admin.database();

var app = express();
var port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(favicon(path.join(__dirname,'public','photos','favicon.ico')));

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

// url to update an existing group
// app.post('/api/group/update', function(req, res) {
// 	var id = req.body.id;
// 	var newid = req.body.newid;
// 	Group.update(id, newid);
// 	res.json({groupid: newid});
// 	res.end();
// });

var User = function(username, userid, location) {
	this.username = username;
	this.userid = userid;
	this.location = location;
}

User.getByUsername = function(username) {
	console.log("requesting user " + username);
	return db.ref('users').orderByChild('username').equalTo(username)
			.once('value').then(function (snapshot) {
		if (snapshot.exists()) {
			var snap = snapshot.val();
			// since we don't know the userid we need to find it
			var key = Object.keys(snap)[0];
			// get relevent user info
			snap = snap[key];
			return new User(snap.username, snap.userid, snap.location);
		}
		else return null;
	});
}

var Group = function(groupid, creator, meeting_time, location, members) {
	this.id = groupid;
	this.creator = creator;
	this.meeting_time = meeting_time;
	this.location = location;
	this.members = members;
};

// OBSOLETE - use /api/group/create
// add new group id to database
// Group.add = function(groupid) {
// 	db.ref('groups/' + groupid).set({
// 		id: groupid
// 	});
// }

// OBSOLETE - not needed
// update group id in database
// Group.update = function(groupid, newid) {
// 	var updates = {}
// 	updates['groups/'+groupid] = newid;
// 	db.ref().update(updates);
// }

// get group by id
Group.getById = function(groupid) {
  console.log("requesting group " + groupid);
  var promises = [];
  // get group object
  promises[0] = db.ref('groups/' + groupid).once('value').then(function (snapshot) {
    if (snapshot.exists()) {
      var snap = snapshot.val();
      return new Group(snapshot.key, snap.creator, snap.meeting_time,
        snap.location, null);
    }
    else return null;
  });
  // get members from group-members
  promises[1] = db.ref('group-members/' + groupid).once('value').then(function (snapshot) {
    if (snapshot.exists()) {
      return snapshot.val();
    }
    else return null;
  });
  // return array with two promises
  return promises;
}

// check if group id exists
Group.exists = function(groupid) {
	Group.getById(groupid).then(function(group) {
		return (group == null) ? false : true;
	});
}

var placeResults = function(res, center) {
  // query object for Places search
  var query = {
    "location": center,
    "language": 'en',
    "radius": 10000,
    "type": 'restaurant'
  }
  // perform query then write results to res
  googleMapsClient.placesNearby(query, function(err, response) {
    if (err) {
        res.status(500).end();
    } else {
      var results = response.json.results;
      var placeIds = [];
      var i = 0;

      results.forEach(function(obj) {
        placeIds[i++] = obj.place_id;
      });

      var json = {
        "count": i,
        "results": placeIds
      };
      res.json(json).end();
    }
  });
}


/* ======================== API calls ======================== */

// using this later to verify that groupid exists
app.param('groupid', function(req, res, next, groupid) {
  // do validation that groupid exists
  var promises = Group.getById(groupid);
  Promise.all(promises).then(values => {
    if (values[0] != null) {
      var group = values[0];
      group.members = values[1];
      req.group = group;
      next();
    }
    else res.status(400).send('group id not found');
  }).catch(reason => {
    console.log(reason);
  });
});

app.param('username', function(req, res, next, username) {
  User.getByUsername(username).then(function(user) {
    if (user != null) {
      req.user = user;
      next();
    } else res.status(400).send('username not found');
  });
});

// calculate center of group and update in the database
// returns collection of place ids to populate in the app
app.get('/api/placeids/:groupid', function(req, res) {
	var group = req.group;

	if (group.location && group.location != "null") {
		var center = {
			"latitude": group.location.latitude,
			"longitude": group.location.longitude
		}

		placeResults(res, center);
	}
	
	// get user locations
	var locations = {};
	var promises = [];
	for (var user in group.members) {
    var userloc = group.members[user].location;
      // the user has not yet put their location into the group
    if (userloc.latitude == 0 && userloc.longitude == 0) {
      promises.push(User.getByUsername(user).then(function(user) {
        if (user != null && user.location != null) locations[user] = user.location;
      }));
    } else {
          locations[user] = group.members[user].location;
      }
  }

	// wait for all promises to finish before moving on
	Promise.all(promises).then(function() {
		// return empty list
		if (locations.length == 0) {
			res.json({"count": 0, "results": []}).end();
			return;
		}

		// find center of locations
		var center = geolib.getCenter(locations);

    // debug
    // console.log(locations);
    // console.log(center);

		placeResults(res, center);
	});
});

// url to create a new group, returns group id
app.post('/api/group/create', function(req, res) {
	// creator is required
	if (!req.body.creator) {
		res.status(400).send('must specify a creator');
		return;
	}

	// Using transaction-based group creation.
	// This will ensure every call gets a unique ID from firebase
	var newGroup = db.ref('groups').push();
	var groupData = {};
	
	groupData.creator = req.body.creator;
	groupData.meeting_time = (req.body.meeting_time) ? req.body.meeting_time : "null";
	groupData.members[groupData.creator] = { "userid": groupData.creator, "location": {"latitude": 0, "longitude": 0}} };
	newGroup.set(groupData);

	// return new id
	res.json({ "groupid": newGroup.key });
	res.end();
});

app.listen(port, function() {
  console.log('App is listening on port ' + port);
});

app.get('/api/user/:username', function(req, res) {
  res.json(res.user);
});
