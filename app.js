const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const User = require('./models/user');
const mongoose = require('mongoose');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('600b594387bcf12f706d606e') //FIXME: Make Compass Work
    .then(user => {
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://hego64:tkCBz3UxJ6J0OqwV@cluster0.cgnnu.mongodb.net/shop?retryWrites=true&w=majority')
.then(result => {

  User.findOne().then(user => {
    console.log(user);
    if (!user){
      const user = new User({
        name: 'Travis',
        email: 'trav@test.com',
        cart: {
          items: []
        }
      });
      user.save();

    }
  });


  app.listen(3000);
})
.catch(err => {
  console.log(err);
})