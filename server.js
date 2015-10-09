// unirest is a lightweight http request client library
var unirest = require('unirest');
var express = require('express');
var events = require('events');

var app = express();

app.use(express.static('public'));

// The args argument is an object containing arguments to provide in the query string of the endpoint
var getFromApi = function(endpoint, args) {
    // This event emitter will be used to communicate whether retrieving the info was successful
    var emitter = new events.EventEmitter();
    // The .qs method takes an object consisting of query strings and appends them to the url upon request
    unirest.get('https://api.spotify.com/v1/' + endpoint)
        .qs(args)
        .end(function(response) {
            // call our own end event after all the data has been received
            if (response.ok) {
                // attach the response body parsed by Unirest
                emitter.emit('end', response.body);
            }
            else {
                // attach the error code returned by Unirest
                emitter.emit('error', response.code);
            }
        });
    return emitter;
};

// When a user makes a request to /search/:name, make a request to the Spotify /search endpoint
app.get('/search/:name', function(req, res) {
    // remember, first argument is our endpoint, second is our object of query strings
    // the endpoint is: /search?q=<name>&limit=1&type=artist
    var searchReq = getFromApi('search', {
        q: req.params.name,
        limit: 1,
        type: 'artist'
    });

    // Add listeners to the EventEmiiter returned from getFromApi
    searchReq.on('end', function(item) {
        var artist = item.artists.items[0];
        res.json(artist);
    });

    searchReq.on('error', function(code) {
        res.sendStatus(code);
    });
});

app.listen(8080);