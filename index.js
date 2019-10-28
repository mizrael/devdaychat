const express = require('express'),
    http = require('http'),
    socket = require('socket.io'),
    rabbit = require('./rabbit');
    
const app = express(),
    port = process.env.PORT || 3000,
    server = http.Server(app),
    io = socket(server);

app.use(express.static('public'));

rabbit().then((r) =>{
    io.on('connection', function (socket) {
        io.set('transports', ['websocket']);
    
        console.log('a user connected');

        r.subscribe((data) =>{
            const msg = JSON.parse(data.toString());    
            io.emit('msgFromServer', msg);
        });
    
        socket.on('disconnect', function(){
            console.log('user disconnected');
        });
    
        socket.on('msgFromClient', function(msg){
            r.publish(msg);
        });    
    });
    
    server.listen(port, () => console.log(`DevDay chat listening on port ${port}!`));
});