var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
const indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use((request, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "PUT, GET, POST, DELETE, OPTIONS");
  next();
});
var cors = require('cors');
app.use(cors());
var mongoose = require('mongoose');
app.model = require('./model');


var AdminUser = app.model('AdminUser');
var result = require('./common/result');

var bodyParser = require('body-parser');
var ApiRoute = require('./controller/api');
var config = require('./config');
var utilMethods = require('./module/utilMethods');
mongoose.connect(config.DatabaseUrl + '/Delavaz', { useNewUrlParser: true });



app.get('/hoveyda', function (req, res) {
  let oAu = new AdminUser();
  oAu.firstName = "Mohammad";
  oAu.lastName = "Hoveyda";
  oAu.email = "hoveyda@delavaz.com";
  oAu.userName = "Hoveyda";
  oAu.password = "a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3";
  oAu.save();
  res.status(200).send({"Message":"The User Admin Had Been Created Successfully"});
})


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false, }));
app.use(cookieParser());
app.use(session({ secret: 'delavazsupersecret', saveUninitialized: true, resave: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/v1/api', indexRouter);





// catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  // res.status(err.status || 500);
  // res.render('error');
});

module.exports = app;
