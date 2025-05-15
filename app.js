var createError = require('http-errors'); //
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

// Database connectie
const { connectToDatabase } = require('./services/database');

var app = express();

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

// Connecteer met database bij opstarten en initialiseer data
connectToDatabase()
    .then(async () => {
      console.log('Database connected, checking for initial data...');

      // Check if we need to add initial data
      const db = require('./services/database').db;
      const count = await db.collection('users').countDocuments();

      if (count === 0) {
        console.log('No users found, adding initial data...');
        const users = [
          { name: "John Doe", email: "john@example.com", createdAt: new Date() },
          { name: "Jane Smith", email: "jane@example.com", createdAt: new Date() },
          { name: "Bob Johnson", email: "bob@example.com", createdAt: new Date() }
        ];

        await db.collection('users').insertMany(users);
        console.log('Initial data added successfully');
      } else {
        console.log(`Found ${count} users, skipping initialization`);
      }
    })
    .catch(console.error);

module.exports = app;