const express = require('express'),
    http = require('http'),
    socket = require('socket.io'),
    rabbit = require('./rabbit');
    
const app = express(),
    port = process.env.PORT || 3000,
    server = http.Server(app),
    io = socket(server);

app.use(express.static('public'));

rabbit((data) =>{
    const msg = JSON.parse(data.toString());    
    io.emit('msgFromServer', msg);
}).then((r) =>{
    io.on('connection', function (socket) {
        io.set('transports', ['websocket']);
    
        console.log('a user connected');
    
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    
        socket.on('msgFromClient', function(msg){
            console.log('message: ' + JSON.stringify(msg));
    
            r.publish(msg);
        });    
    });
    
    server.listen(port, () => console.log(`Example app listening on port ${port}!`));
});

