var should = require('should'); 
var assert = require('assert');
var request = require('supertest'); 

describe('Firebase database', function() {
    it('should be able to make a test user', function(done) {
        var url = "localhost:3000";
        var userData = {
            username: 'test',
            name: 'Test User',
            location: { 'latitude': 30, 'longitude': 70 }
        };

        // send request
        request(url)
            .post('/testapi/user')
            .send(userData)
            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                // this is should.js syntax, very clear
                res.should.have.status(200);
                done();
        });
    });

    it('should be able to get a test user', function(done) {
        var url = "localhost:3000";
        var userData = {
            username: 'test',
            name: 'Test User',
            location: { 'latitude': 30, 'longitude': 70 }
        };

        // send request
        request(url)
            .post('/testapi/user')
            .send(userData)
            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                // this is should.js syntax, very clear
                res.should.have.status(200);
                done();
        });
    });
});
