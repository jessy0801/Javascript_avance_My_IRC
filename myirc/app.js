var express = require('express');

var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);

var index = require('./routes/index');
var users = require('./routes/users');



var app = express();

// Mongo Connection

mongoose.connect("mongodb://localhost:27017/test");
    //var collection = db.collection('chat messages');




var db = mongoose.connection;
// mongo error
db.on('error', console.error.bind(console, 'connection error:'));

var channel_list = db.collection('channels');
// use sessions for tracking logins
app.use(session({
    secret: 'jah is right',
    resave: true,
    saveUninitialized: false,
    store: new MongoStore({
        mongooseConnection: db
    })
}));

// view engine setup
app.use(express.static(__dirname + '/public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});
var port = 3000;
var io = require('socket.io').listen(app.listen(port));
console.log("Listening on port " + port);

io.sockets.on('connection', function (socket) {
    console.log("New connection : " + socket.handshake.address);
    socket.on('room', function(room) {
        //socket.leave(rom);
        socket.join(room);
        //socket.in(room).emit('message', { message: 'welcome to myirc' });
        socket.emit('message', { message: 'welcome to channel : '+room });

        rom = room;
    });
    socket.on('add_room', function(room) {
        //socket.leave(rom);

        channel_list.insert({Nom_chaine: room.roomname, Createur: room.name });
        socket.join(room.roomname);
        //socket.in(room).emit('message', { message: 'welcome to myirc' });
        socket.emit('message', { message: 'welcome to channel : '+room.roomname });

        rom = room;
    });


    socket.on('send', function (data) {

        io.sockets.in(rom).emit('message', data);

        /*collection.insert({ content: data.name+':'+data.message }, function(err, o) {
            if (err) { console.warn(err.message); }
            else { console.log("chat message inserted into db: " + data.name+':'+data.message); }
        });

        var stream = collection.find().sort({ _id : -1 }).limit(10).stream();
        stream.on('data', function (chat) { socket.emit('message', chat.content); });*/

        console.log("Message de " +data.name + " : " + data.message.substr(data.message.indexOf('</a>')+7));
    });
});

module.exports = app;
