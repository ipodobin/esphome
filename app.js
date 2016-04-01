var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var fs = require("fs");
var sqlite3 = require("sqlite3").verbose();
var dot = require('express-dot-engine');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
app.engine('html', dot.__express);
app.set('view engine', 'dot');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// inicjalizacja bazy danych
var file = /*"/" + */"test.db";
var exists = fs.existsSync(file);
if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}
var db = new sqlite3.Database(file);
db.serialize(function() {
  if(!exists) {
    db.run('CREATE TABLE sensors (chip_id VARCHAR(10), room_id INTEGER, type SMALLINT, register_date DATE)');
    db.run('CREATE TABLE logs (chip_id VARCHAR(10), date DATE, type VARCHAR(10))');
  }  
  // var stmt = db.prepare("INSERT INTO Stuff VALUES (?)");  
  // //Insert random data
  // var rnd;
  // for (var i = 0; i < 10; i++) {
  //   rnd = Math.floor(Math.random() * 10000000);
  //   stmt.run("Thing #" + rnd);
  // }
  // stmt.finalize();
  // db.each("SELECT rowid AS id, thing FROM Stuff", function(err, row) {
  //   console.log(row.id + ": " + row.thing);
  // });
});
// db.close();

// Make our db accessible to our router
app.use(function(req,res,next){
    req.db = db;
    next();
});

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error.html', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error.html', {
    message: err.message,
    error: {}
  });
});

app.get('/', function (req, res) {
  res.send('Hello World!');
});


module.exports = app;
