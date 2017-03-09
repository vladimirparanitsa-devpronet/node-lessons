const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const exphbs  = require('express-handlebars');

const index = require('./routes/index');
const users = require('./routes/users');
const serverConfig = require('../config/server');

const app = express();

// view engine setup
// app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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
console.log(err);
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.use(function(err, req, res, next) {
  const {name, surname, phone, email, product} = req.body;

  const fieldEmpty = [name, surname, phone, email, product].some((field) => {
    return validator.isEmpty(field);
  });

  switch (true) {
    case fieldEmpty:
      req.error = {field: 'required', message: 'Вы не заполнили все обязательные поля'};
      return res.redirect('/?error_id=required_field');
    case nodePhone(phone, 'UA').length === 0:
      req.error = {field: 'phone', message: 'Не верный формат телефона'};
      return res.redirect('/?error_id=invalid_tel');
    case ! validator.isEmail(email):
      req.error = {field: 'email', message: 'Не верный email'};
      return res.redirect('/?error_id=invalid_email');
  }

  next();
});

app.listen(serverConfig.port, () => {
  console.log(`http://127.0.0.1:${serverConfig.port}`);
});

module.exports = app;
