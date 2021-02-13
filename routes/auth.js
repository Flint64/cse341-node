const express = require('express');
const { check, body } = require('express-validator/check');
const User = require('../models/user');
const isAuth = require('../middleware/is-auth');

const authController = require('../controllers/auth');

const router = express.Router();

router.get('/login', authController.getLogin);

router.get('/signup', authController.getSignup);

router.post('/login', [
    body('email').isEmail().withMessage('Please enter a valid email').normalizeEmail(),
    body('password', 'Password must be at least 5 characters and only text & numbers').isLength({min: 5}).isAlphanumeric().trim()
], authController.postLogin);



router.post('/signup', 
[
check('email')
    .isEmail()
    .withMessage('Please enter a valid email')
.custom((value, {req}) => {
    // if (value === 'test@test.com'){
    //     throw new Error('This email address is forbidden');
    // }
    // return true;

  return User.findOne({ email: value })
    .then(userDoc => {
        if (userDoc){
            return Promise.reject('Email is alreay in use');
        }   
});
}).normalizeEmail(),
body('password','Password must be at least 5 characters and only text & numbers').isLength({min: 5}).isAlphanumeric().trim(),
body('confirmPassword').trim().custom((value, {req}) => {
    if (value !== req.body.password){
        throw new Error('Passwords have to match');
    }
    return true;
}),
body('username').isLength({min: 5}).isAlphanumeric().trim()
],
 authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/reset/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

router.get('/profile', isAuth, authController.getProfile);

router.post('/DelAccount', isAuth, authController.postDelAccount);

module.exports = router;