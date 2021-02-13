const path = require('path');

const express = require('express');
const { body } = require('express-validator/check');

const shopController = require('../controllers/shop');
const isAuth = require('../middleware/is-auth');

const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart', isAuth, shopController.getCart);

router.post('/cart', isAuth, shopController.postCart);

router.post('/cart-delete-item', isAuth, shopController.postCartDeleteProduct);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.post('/postReview', body('review', 'Review is required').isString().isLength({ min: 10 }).trim(), isAuth, shopController.postReview);

module.exports = router;





// router.post('/postReview', 
// [
//     body('title')
//       .isString()
//       .isLength({ min: 3 })
//       .trim(),
//     body('imageUrl').isURL(),
//     body('price').isFloat(),
//     body('description')
//       .isLength({ min: 5, max: 400 })
//       .trim()
//   ],
// isAuth, shopController.postReview);