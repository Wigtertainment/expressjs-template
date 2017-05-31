var _ = require("lodash");

var express = require('express');
var app = express();
var port = process.env.PORT || 3000;
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var flash = require('connect-flash');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');

var person = require('./app/routes/person.js');
var User = require('./app/models/user');

var configDB = require('./config/database.js');
require('./config/passport.js')(passport);

var authConf = require('./config/auth.js');

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

app.post("/login", function (req, res) {
    if (req.body.email && req.body.password) {
        var email = req.body.email;
        var password = req.body.password;
    }

    User.findOne({ 'local.email': email }, function (err, user) {
        if (!user) {
            res.status(401).json({ message: "no such user found" });
        }

        if (user.validPassword(password)) {
            // from now on we'll identify the user by the id and the id is the only personalized value that goes into our token
            var payload = { id: user.id };
            var token = jwt.sign(payload, authConf.secretOrKey);
            res.json({ message: "ok", token: token });
        } else {
            res.status(401).json({ message: "passwords did not match" });
        }
    });
});

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

app.listen(port);