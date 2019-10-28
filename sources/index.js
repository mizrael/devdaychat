const express = require('express'),
    http = require('http'),
    socket = require('socket.io');

const app = express(),
    port = 3000,
    server = http.Server(app),
    io = socket(server);

app.use(express.static('public'));

server.listen(port, () => console.log(`Example app listening on port ${port}!`));

io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('disconnect', function(){
        console.log('user disconnected');
    });

    socket.on('msgFromClient', function(msg){
        console.log('message: ' + JSON.stringify(msg));

        io.emit('msgFromServer', msg);
    });
});