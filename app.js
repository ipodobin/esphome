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
var file = "test.db";
var exists = fs.existsSync(file);
if(!exists) {
  console.log("Creating DB file.");
  fs.openSync(file, "w");
}
var db = new sqlite3.Database(file);
var rev = 0;
if(!exists) {
  db.serialize(function() {
    db.run('CREATE TABLE app_rev (rev INTEGER)');
    db.run('CREATE TABLE sensors (chip_id VARCHAR(10) PRIMARY KEY NOT NULL, room_id INTEGER, type SMALLINT, register_date DATE, ipaddress VARCHAR(15))');
    db.run('CREATE TABLE logs (chip_id VARCHAR(10), date DATE, type VARCHAR(10))');
    db.run('CREATE TABLE relays (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(50), _index INTEGER, chip_id VARCHAR(10))');
    db.run('CREATE TABLE rooms (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(50), chip_id VARCHAR(10), dimensions VARCHAR(100))');
    rev = 2;
    db.serialize(function() {
      db.run('UPDATE app_rev SET rev=' + rev + ';');
    });
  });
} else {
  db.serialize(function() {
    var query = 'SELECT rev FROM app_rev;';
    db.get(query, function(err, row) {
      if(err) {
        console.log(err.message);
      } else if(row != null) {
        rev = row.rev;
      } else {
        rev = 0;
        db.run('INSERT INTO app_rev VALUES(' + rev + ');');
      }
      switch(rev) {
        case 0:
        db.run('CREATE TABLE rooms (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, name VARCHAR(50), chip_id VARCHAR(10), dimensions VARCHAR(100))');
        rev++;

      }
      db.serialize(function() {
        db.run('UPDATE app_rev SET rev=' + rev + ';');
      });
    });
  });
}
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
