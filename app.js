var express = require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);


var playerList = [];


app.use(express.static(__dirname + '/'));
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
    res.sendfile('index.html');
});
/*

app.get('/joystick', function(req, res){
  res.sendfile('joystick.html');  
 // res.render('index',{ title: 'The index page!' });
});
*/


http.listen(3000, function() {
    console.log('listening on *:3000');
});

io.on('connection', function(socket) {
    console.log('a user connected');
    var this_id;
    socket.on('register', function(msg) {
        //io.emit('chat2','bbb');
        // io.emit('update sprite',msg);
        this_id = msg.id;
        playerList.push(msg.id);
        io.emit('addNewPlayer', msg.id);

        socket.on('disconnect', function() {
            io.emit('disconnect', this_id);
            console.log('user disconnected');
        });

    })

    socket.on('update', function(msg) {
        io.emit('update sprite', msg);      
    })

   

    socket.on('fire', function(msg) {
        console.log(msg);
        io.emit('fire', msg);
    })

    socket.on('get score', function(msg) {
        io.emit('get score', msg);
    })


});
