var should = require('should'); 
var assert = require('assert');
var request = require('supertest'); 

var url = "http://localhost:3000";

describe('Firebase database', function() {
    it('should be able to make a test user', function(done) {
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
                res.status.should.equal(200);
                done();
        });
    });

    it('should be able to get the test user', function(done) {
        // send request
        request(url)
            .get('/testapi/user/test')
            .expect(200)
            .expect('Content-Type', /json/)
            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                done();
        });
    });

    it('should be able to delete the test user', function(done) {
        // send request
        request(url)
            .delete('/testapi/user/test')
            .expect(200)
            // end handles the response
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                done();
        });
    });
});

describe('Test API call', function() {
    it('should be able to get the test group', function(done) {
        request(url)
            .get('/api/placeids/test')
            .expect(200)
            .end(function(err, res) {
                if (err) {
                    throw err;
                }
                res.body.count.should.equal(20);
                done();
            });
    });
});
