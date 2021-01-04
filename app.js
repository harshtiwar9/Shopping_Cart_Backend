var createError = require('http-errors');
var express = require('express');
var path = require('path');
var fs = require('fs');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//middleware to log information
app.use(function(req,res,next){

  let log = "\nLogging info...\n";
  log += ((new Date()).toUTCString())+"\n";
  log += "Request : "+req.method+" "+req.originalUrl+"\n";

  fs.appendFile('log.txt', log, function (err) {
    if (err) return console.log(err);
    console.log(log);
  });

  next();
})

app.use('/', indexRouter);
// app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(err,req, res, next) {
  console.error(err.stack)
  res.status(404).json({success: false})
  // res.render(createError(404))
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  let log = "\nLogging info...\n";
  log += ((new Date()).toUTCString())+"\n";
  log += "Request : "+req.method+" "+req.originalUrl+"\n";
  log += "Error : "+err.status;
  log += "Error Message : "+err.message;

  // fs.appendFile('log.txt', log, function (err) {
  //   if (err) return console.log(err);
  //   console.log(log);
  // });
  logInformation("error",log);
  // render the error page
  res.status(err.status || 500);
  // res.render('error');
  try {
    res.json(JSON.parse(err.message))
  } catch (error) {
    res.json(err.message)
  }

  console.log("Here!")
  
});

module.exports = app;
