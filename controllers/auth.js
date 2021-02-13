const User = require('../models/user');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const crypto = require('crypto');
const { validationResult } = require('express-validator/check')
 
const transporter = nodemailer.createTransport(sendgridTransport({
  auth: {
    api_user: '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'
  }
}));

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: { email: '', password: '' },
    validationErrors: []
  });
};

exports.getProfile = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/profile', {
    path: '/profile',
    pageTitle: 'Profile',
    errorMessage: message,
    email: req.session.user.email,
    username: req.session.user.username
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {
      email: '',
      password: '',
      confirmPassword: '',
      username: ''
    },
    validationErrors: []
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()){
  return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password},
      validationErrors: errors.array()
    });
  }

  User.findOne({ email: email })
    .then(user => {
      if (!user){
        // req.flash('error', 'Invalid email or password');
        return res.status(422).render('auth/login', {
          path: '/login',
          pageTitle: 'Login',
          errorMessage: 'Invalid email or password',
          oldInput: {email: email, password: password},
          validationErrors: []
        });
      }
      bcrypt.compare(password, user.password)
      .then(doMatch => {
        if (doMatch){
          console.log(user);
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save(err => {
            console.log(err);
            res.redirect('/');
      });
    }
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: 'Invalid email or password',
      oldInput: {email: email, password: password},
      validationErrors: []
    });
      })
      .catch(err => {
        console.log(err);
        res.redirect('/login');
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const username = req.body.username;
  const errors = validationResult(req);  
  console.log(errors);
  if (!errors.isEmpty()){
    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      errorMessage: errors.array()[0].msg,
      oldInput: {email: email, password: password, confirmPassword: req.body.confirmPassword, username: username},
      validationErrors: errors.array()
    });
  }
  
   bcrypt.hash(password, 12).then(hashedPassword => {
      const user = new User({
        email: email,
        password: hashedPassword,
        username: username,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'auc16001@byui.edu',
        subject: 'Signup',
        html: '<h1>You successfully signed up!</h1>'
      });
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  })
}

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  }); 
}

exports.postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err){
      console.log(err);
      return res.redirect('/reset');
    }
    const token = buffer.toString('hex');
    User.findOne({email: req.body.email})
    .then(user => {
      if (!user) {
        req.flash('error', 'No account with that email found');
        return res.redirect('/reset');
      }
      user.resetToken = token;
      user.resetTokenExpiration = Date.now() + 3600000;
      return user.save();
    })
    .then(result => {
      res.redirect('/');
      transporter.sendMail({
        to: req.body.email,
        from: 'auc16001@byui.edu',
        subject: 'Password Reset',
        html: `
        <p>You requested a password reset</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link<a> to set a new password</p>
        `
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
    });
  });
};

exports.getNewPassword = (req, res, next) => {
const token = req.params.token;
User.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
.then(user => {
  let message = req.flash('error');
  if (message.length > 0){
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/new-password', {
    path: '/new-password',
    pageTitle: 'New Password',
    errorMessage: message,
    userId: user._id.toString(),
    passwordToken: token
  });
})
.catch(err => {
  const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
});

}

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;

  User.findOne({resetToken: passwordToken, resetTokenExpiration: {$gt: Date.now()}, _id: userId})
  .then(user => {
    resetUser = user;
    return bcrypt.hash(newPassword, 12);
  })
  .then(hashedPassword => {
    resetUser.password = hashedPassword;
    resetUser.resetToken = null;
    resetUser.resetTokenExpiration = undefined;
    return resetUser.save();
  })
  .then(result => {
    res.redirect('/login');
  })
  .catch(err => {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  })
}

exports.postDelAccount = (req, res, next) => {

  User.deleteOne({email: req.session.user.email}).then(result => {

    req.session.destroy(err => {
      console.log("Account Deleted");
      console.log(err);
      res.redirect('/signup');
    });
  })
  .catch(err => {
    const error = new Error(err);
      error.httpStatusCode = 500;
      return next(err);
  })
};