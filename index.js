const express = require('express'),
    http = require('http'),
    socket = require('socket.io'),
    rabbit = require('./rabbit');
    
const app = express(),
    port = process.env.PORT || 3000,
    server = http.Server(app),
    io = socket(server);

app.use(express.static('public'));

const users = {};

rabbit().then((r) =>{
    io.on('connection', function (socket) {
        io.set('transports', ['websocket']);
    
        console.log('a user connected');

        r.subscribe(socket.id, (data) =>{
            const msg = JSON.parse(data.toString());    
            io.emit('msgFromServer', msg);
        });
    
        socket.on('disconnect', function(){
            delete users[socket.id];      
            
            r.unsubscribe(socket.id).then(() =>{
                const name = users[socket.id] || socket.id;
                console.log(`user ${name} disconnected`);
            });                
            
            io.emit('users', users);
        });

        socket.on('newNickname', function(nickname){
            users[socket.id] = nickname;
            io.emit('users', users);
        });    
    
        socket.on('msgFromClient', function(msg){
            r.publish(msg);
        });    
    });
    
    server.listen(port, () => console.log(`DevDay chat listening on port ${port}!`));
});