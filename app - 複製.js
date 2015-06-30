var express = require('express');

var app = express();
var admin = express();

//important
app.use(express.static(__dirname));
// define routes
app.get('/', function(req, res){
    res.send('hello! express！ this is a index');

   //  res.sendfile('./index.html');
});

app.set('view engine', 'ejs');

admin.get('/',function(req,res){
	console.log(admin.mountpath);
	res.send('admin aa');
})



var secret = express();
secret.get('/',function(req,res){
	console.log(secret.mountpath);
	res.send('secret');
})

admin.use('/secr**',secret);

app.use(['/adm*n'],admin);

app.param('id',function(req,res,next,id){
	console.log("call");
	next();
})

app.get('/user/:id',function(req,res,next){
	console.log(req.params.id);
	res.send(req.params.id);
	next();
})

app.post('/',function(req,res){
	res.send('post');
})

app.listen(1337, function () {
    console.log('ready on port 1337');
})