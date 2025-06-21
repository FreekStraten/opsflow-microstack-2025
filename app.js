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

// Database initialization - only in non-test environments
const { db } = require('./services/database');

// Only add initial data when not in test environment
if (!isTestEnvironment) {
    // Wait for database connection and add initial data if needed
    setTimeout(async () => {
        try {
            console.log('Database connected, checking for initial data...');

            // Check if we have any users
            const userCount = await db.collection('users').countDocuments();

            if (userCount === 0) {
                console.log('No users found, adding initial data...');

                // Add some initial users
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
    }, 1000); // Wait 1 second for database connection to be established
} else {
    console.log('Test environment detected, skipping initial data setup');
}

module.exports = app;