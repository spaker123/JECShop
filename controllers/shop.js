const Product = require('../models/product');
const Order = require('../models/order');
const stripe_config = require('../config/stripe.js');
const stripe = require("stripe")(stripe_config.SE_ID);




exports.getProductsbyCategory = (req, res, next) => {

  Product.find({category:req.params.category})
    .then(products => {
      res.render('shop/product-list', {
        user: req.user,
        prods: products,
        pageTitle: products.category + 'Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    .then(products => {
      console.log(products);
      res.render('shop/product-list', {
        user: req.user,
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        user: req.user,
        product: product,
        pageTitle: product.title,
        path: '/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        user: req.user,
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getCart = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      console.log(result);
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {
  const token = req.body.stripeToken; 
  let totalSum = 0;
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items.map(i => {
        return { quantity: i.quantity, product: { ...i.productId._doc } };
      });
      const order = new Order({
        user: {
          name: req.user.name,
          userId: req.user
        },
        products: products
      });
      return order.save();
    })
    .then(result => {

    const charge = stripe.charges.create({
        amount: totalSum * 100,
        currency: 'usd',
        description: 'Demo Order',
        source: token,
        metadata: { order_id: result._id.toString() }
      });

      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
};

exports.getOrders = (req, res, next) => {
  Order.find({ 'user.userId': req.user._id })
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.getCheckout = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      res.render('shop/checkout', {
        path: '/checkout',
        pageTitle: 'checkout',
        products: products,
        totalSum: total,
        isAuthenticated: req.session.isLoggedIn        
      });
    })
    .catch(err => console.log(err));
};