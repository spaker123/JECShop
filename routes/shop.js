const path = require('path');

const express = require('express');

const shopController = require('../controllers/shop');
const isUser = require('../middleware/is-user');
const router = express.Router();

router.get('/', shopController.getIndex);

router.get('/products', shopController.getProducts);

router.get('/products/:productId', shopController.getProduct);

router.get('/cart',isUser, shopController.getCart);

router.post('/cart',isUser, shopController.postCart);

router.post('/cart-delete-item',isUser, shopController.postCartDeleteProduct);

router.get('/products/category/:category', shopController.getProductsbyCategory);

router.post('/create-order',isUser, shopController.postOrder);

router.get('/orders',isUser, shopController.getOrders);

router.get('/checkout',isUser,shopController.getCheckout);

//paypal
router.post('/create-order2',isUser, shopController.postOrder2);
router.get('/checkout2', shopController.getCheckout2);
router.get('/process', shopController.getOrderProcess);
router.get('/cancel', shopController.getOrderCancel);

module.exports = router;
