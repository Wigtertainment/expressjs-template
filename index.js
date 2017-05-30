var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var person = require('./app/routes/person.js');

var configDB = require('./config/database.js');
require('./config/passport.js')(passport);

mongoose.connect(configDB.url);

app.use(morgan('dev'));
app.use(express.static('public'));

//To parse URL encoded data
app.use(bodyParser.urlencoded({ extended: false }))
//To parse json data
app.use(bodyParser.json())

// required for passport
app.use(session({
    secret: 'ilovescotchscotchyscotchscotch', resave: false,
    saveUninitialized: true,
    cookie: { secure: true }
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());

app.use('/person', function (req, res, next) {
    console.log("A new request received at " + Date.now());
    next();
});

app.use('/person', person);

app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
});

// app.post('/signup', passport.authenticate('local-signup', {
//     successMessage: 'Signup success',
//     failureRedirect: '/signup', // redirect back to the signup page if there is an error
//     failureFlash: true // allow flash messages
// }));

app.post('/signup', function (req, res, next) {
    console.log("Signup");
    passport.authenticate('local-signup', function (err, user, info) {
        if (err) { return next(err); }
        if (!user) { return res.json({ message: "Error signup" }); }
        req.logIn(user, function (err) {
            if (err) { return next(err); }
            return res.json({ message: "Signup Success" });
        });
    })(req, res, next);
});

app.get('*', function (req, res) {
    res.send('Sorry, this is an invalid URL.');
});

function isLoggedIn(req, res, next) {

    // if user is authenticated in the session, carry on 
    if (req.isAuthenticated())
        return next();

    // if they aren't redirect them to the home page
    res.redirect('/');
}

app.listen(port);