const path = require('path');

const express = require('express');

const adminController = require('../controllers/admin');
const isAuth = require('../middleware/is-auth');

const router = express.Router();
const upload = require('../config/multer.config.js');

// /admin/add-product => GET
router.get('/add-product', isAuth, adminController.getAddProduct);

// /admin/products => GET
router.get('/products',isAuth, adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',isAuth, upload.single('image'), adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth, adminController.getEditProduct);

router.post('/edit-product',isAuth, adminController.postEditProduct);

router.post('/delete-product',isAuth, adminController.postDeleteProduct);

// /admin/categories
router.get('/categories',isAuth, adminController.getCategories);


// /admin/add-category => GET & POST
router.get('/add-category', isAuth, adminController.getAddCategory);
router.post('/add-category',isAuth, adminController.postAddCategory);

router.get('/edit-category/:categoryId',isAuth, adminController.getEditCategory);
router.post('/edit-category/:categoryId',isAuth, adminController.postEditCategory);

router.get('/delete-category/:categoryId',isAuth, adminController.DeleteCategory);


module.exports = router;


