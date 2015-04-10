var express = require('express');
var tileLode = require('./index');

var app = express();
app.set('port', process.env.PORT || 3000);
app.use('/example', express.static(__dirname + '/example'));
app.use('/tileLode', tileLode.createApp());

app.listen(app.get('port'));
console.log('Node.js server listening on port ' + app.get('port'));
