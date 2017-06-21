'use strict';

var express = require('express');
var app = express();

app.get('/', function (req, res, next) {
    res.sendFile(__dirname + '/index.html', {});
});

app.use(express.static('.'));

app.listen(8080, function () {
    console.log('works!');
});
