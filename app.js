var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path');


var RedisStore = require('socket.io/lib/stores/redis')
  , redis  = require('socket.io/node_modules/redis')
  , pub    = redis.createClient()
  , sub    = redis.createClient()
  , client = redis.createClient();


var app = express();
var server = http.createServer(app)

app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.get('/', routes.index);

server.listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require("socket.io").listen(server)

io.set('log level', 1); // reduce logging
io.set('store', new RedisStore({
  redisPub : pub
, redisSub : sub
, redisClient : client
}));

io.sockets.on('connection', function (socket) {
  socket.on('who', function(data) {
    socket.emit('connected', io.sockets.manager.connected)
    socket.broadcast.emit('connected', io.sockets.manager.connected )
  })

  socket.on('ua', function(data) {
    socket.set('id', socket.id)
    socket.set('ua', data.ua)
    client.sadd('userAgents', data.ua)
  })
});

io.sockets.on('disconnect', function (socket) {
  socket.emit('connected', io.sockets.manager.connected)
  socket.broadcast.emit('connected', io.sockets.manager.connected )
});












