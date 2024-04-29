const express = require('express');
const router = express.Router();
const defaultController = require('../controllers/defaultController');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel').User;

router.all('/*', (req, res, next) => {
    req.app.locals.layout = 'default';
    next();
});

// Defining Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, async (req, email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, req.flash('error-message', 'User not found with this email.'));
        }

        const passwordMatched = await bcrypt.compare(password, user.password);
        if (!passwordMatched) {
            return done(null, false, req.flash('error-message', 'Invalid Username or Password'));
        }

        return done(null, user, req.flash('success-message', 'Login Successful'));
    } catch (error) {
        return done(error);
    }
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(async function(id, done) {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (error) {
        done(error);
    }
});

router.route('/')
    .get(defaultController.index);

router.route('/login')
    .get(defaultController.loginGet)
    .post(passport.authenticate('local', {
        successRedirect: '/admin',
        failureRedirect: '/login',
        failureFlash: true,
        successFlash: true,
        session: true
    }), defaultController.loginPost);

router.route('/register')
    .get(defaultController.registerGet)
    .post(defaultController.registerPost);

router.route('/post/:id')
    .get(defaultController.getSinglePost)
    .post(defaultController.submitComment);

router.get('/logout', (req, res) => {
    req.logout(function(err) {
        if (err) {
            console.error(err);
            return next(err);
        }
        req.flash('success-message', 'Logout was successful');
        res.redirect('/');
    });
});

module.exports = router;
