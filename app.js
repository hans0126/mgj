var express =  require('express');

var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.use(express.static(__dirname));

app.set('view engine', 'ejs');

app.get('/', function(req, res){
  res.sendfile('index.html');
});

app.get('/game', function(req, res){
  //res.sendfile('index.html');  
  res.render('index',{ title: 'The index page!' });
});


http.listen(3000, function(){
  console.log('listening on *:3000');
});

io.on('connection', function(socket){
  console.log('a user connected');

  socket.on('chat',function(msg){
  	io.emit('chat2','bbb');

  })

  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});