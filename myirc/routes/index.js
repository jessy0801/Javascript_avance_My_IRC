var express = require('express');
var passport = require('passport');
var router = express.Router();
var User = require('./model/users.js');
var mid = require('../middleware');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/*/!* GET Hello World page. *!/
router.get('/helloworld', function(req, res) {
    res.render('helloword', { title: 'Hello, World!' });
});*/

router.get('/profile', mid.requiresLogin, function(req, res, next) {
    User.findById(req.session.userId)
        .exec(function (error, user) {
            if (error) {
                return next(error);
            } else {
                return res.render('profile', { title: 'Profile', name: user.name});
            }
        });
});

router.get('/create', function(req, res) {
    res.render('create', { title: 'My_irc - Create Channel' });
});
router.get('/logout', function(req, res, next) {
    if (req.session) {
        // delete session object
        req.session.destroy(function(err) {
            if(err) {
                return next(err);
            } else {
                return res.redirect('/');
            }
        });
    }
});

router.get('/list', function(req, res) {
    res.render('list', { title: 'My_irc - List Channel' });


});



// GET /login
router.get('/login', mid.loggedOut, function(req, res, next) {
    return res.render('login', { title: 'Login'});
});

// POST /login
router.post('/login', function(req, res, next) {
    if (req.body.email && req.body.password) {
        User.authenticate(req.body.email, req.body.password, function (error, user) {
            if (error || !user) {
                var err = new Error('Wrong email or password.');
                err.status = 401;
                return next(err);
            }  else {
                req.session.userId = user.id;
                return res.redirect('/profile');
            }
        });
    } else {
        var err = new Error('Email and password are required.');
        err.status = 401;
        return next(err);
    }
});

// GET /register
router.get('/signup', mid.loggedOut, function(req, res, next) {
    return res.render('signup', { title: 'Sign Up' });
});

// POST /signup
router.post('/signup', function(req, res, next) {
    if (req.body.email &&
        req.body.username &&
        req.body.password &&
        req.body.confirmPassword) {

        // confirm that user typed same password twice
        if (req.body.password !== req.body.confirmPassword) {
            var err = new Error('Passwords do not match.');
            err.status = 400;
            return next(err);
        }

        // create object with form input
        var userData = {
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        };

        // use schema's `create` method to insert document into Mongo
        User.create(userData, function (error, user) {
            if (error) {
                return next(error);
            } else {
                req.session.userId = user._id;
                return res.redirect('/profile');
            }
        });

    } else {
        var err = new Error('All fields required.');
        err.status = 400;
        return next(err);
    }
});

router.get('/helloworld', function(req, res) {
    res.render('helloword', { title: 'Hello, World!' });
});

module.exports = router;
