var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// Check if we're in test environment
const isTestEnvironment = process.env.NODE_ENV === 'test';

// Prometheus HTTP metrics (moet VÓÓR routes en 404)
const promBundle = require('express-prom-bundle');
const metricsMiddleware = promBundle({
  includeMethod: true,
  includePath: true,
  customLabels: { app: 'api' },
  // je kunt metrics uitzetten in tests als je wilt:
  promClient: { collectDefaultMetrics: { timeout: 5000 } }
});
if (!isTestEnvironment) {
  app.use(metricsMiddleware); // exposeert /metrics
}

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
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  res.status(err.status || 500);
  res.render('error');
});

// Database initialization - only in non-test environments
const { db } = require('./services/database');

if (!isTestEnvironment) {
  setTimeout(async () => {
    try {
      console.log('Database connected, checking for initial data...');
      const userCount = await db.collection('users').countDocuments();
      if (userCount === 0) {
        console.log('No users found, adding initial data...');
        const initialUsers = [
          { name: 'John Doe', email: 'john@example.com', age: 30 },
          { name: 'Jane Smith', email: 'jane@example.com', age: 25 },
          { name: 'Bob Johnson', email: 'bob@example.com', age: 35 }
        ];
        await db.collection('users').insertMany(initialUsers);
        console.log('Initial data added successfully');
      } else {
        console.log(`Found ${userCount} existing users, skipping initial data`);
      }
    } catch (error) {
      console.error('Error initializing database data:', error);
    }
  }, 1000);
} else {
  console.log('Test environment detected, skipping initial data setup');
}

module.exports = app;
