var should = require('should'); 
var assert = require('assert');
var request = require('supertest');  
var mongoose = require('mongoose');
var winston = require('winston');

describe('Firebase database', function() {
	it('should be able to get the test user', function(done) {
      var profile = {
        username: 'vgheri',
        password: 'test',
        firstName: 'Valerio',
        lastName: 'Gheri'
      };
    // once we have specified the info we want to send to the server via POST verb,
    // we need to actually perform the action on the resource, in this case we want to 
    // POST on /api/profiles and we want to send some info
    // We do this using the request object, requiring supertest!
    request(url)
	.post('/api/profiles')
	.send(profile)
    // end handles the response
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          // this is should.js syntax, very clear
          res.should.have.status(400);
          done();
        });
    });

	it('should be able to get the test group', function(done) {
      var profile = {
        username: 'vgheri',
        password: 'test',
        firstName: 'Valerio',
        lastName: 'Gheri'
      };
    // once we have specified the info we want to send to the server via POST verb,
    // we need to actually perform the action on the resource, in this case we want to 
    // POST on /api/profiles and we want to send some info
    // We do this using the request object, requiring supertest!
    request(url)
	.post('/api/profiles')
	.send(profile)
    // end handles the response
	.end(function(err, res) {
          if (err) {
            throw err;
          }
          // this is should.js syntax, very clear
          res.should.have.status(400);
          done();
        });
    });
});
