var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();



// Chat API Key:    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

// MONGO_DB_URI: "mongodb+srv://janpppherrmann:<db_password>@learningassistant.q6w19va.mongodb.net/?retryWrites=true&w=majority&appName=learningAssistant";

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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

module.exports = app;
