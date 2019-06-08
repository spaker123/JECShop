const Product = require('../models/product');
const Order = require('../models/order');
const stripe_config = require('../config/stripe.js');
const stripe = require("stripe")(stripe_config.SE_ID);
const recommend = require('../util/recommend');
const paypal = require('paypal-rest-sdk');
const paypal_config = require('../config/paypal.js');

paypal.configure({
  'mode': 'sandbox', 
  'client_id': paypal_config.PAYPAL_CLIENT_ID,
  'client_secret': paypal_config.PAYPAL_SECRET
});


const ITEMS_PER_PAGE = 2;

exports.getProductsbyCategory = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find({category:req.params.category})
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find({category:req.params.category})
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then(products => {
      res.render('shop/product-list', {
        user: req.user,
        prods: products,
        pageTitle: products.category + 'Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,          
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalItems;

  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then(products => {
      //console.log(products);
      res.render('shop/product-list', {
        user: req.user,
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        isAuthenticated: req.session.isLoggedIn,          
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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
  const page = +req.query.page || 1;
  let totalItems;
  Product.find()
  .countDocuments()
  .then(numProducts => {
    totalItems = numProducts;
    return Product.find()
      .skip((page - 1) * ITEMS_PER_PAGE)
      .limit(ITEMS_PER_PAGE);
  })
    .then(products => {
      res.render('shop/index', {
        user: req.user,
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        isAuthenticated: req.session.isLoggedIn,       
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE)
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

      recommend((error, productData) => {
        if (error) {
          return console.log(error);
      }  
      Product.find( {_id: {$in: productData.body}} )
      .then(rec => {
        res.render('shop/cart', {
          path: '/cart',
          pageTitle: 'Your Cart',
          products: products,
          recprods:rec,
          isAuthenticated: req.session.isLoggedIn
        });
      });
      }) 
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
      //console.log(result);
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

exports.postOrder2 = (req, res, next) => {

  const create_payment_json = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": "http://localhost:3000/process",
        "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "price": "25.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "25.00"
        },
        "description": "paypal test"
    }]

  }
  

  paypal.payment.create(create_payment_json, function(error, payment){
    if (error) {
      throw error;
  } else {
      for(let i = 0;i < payment.links.length;i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
      console.log(payment);
  }
});
};

exports.getOrderProcess = (req, res, next) => {
  const payerId = req.query.PayerID;
  const paymentId = req.query.paymentId;

  console.log('payerId', payerId);
  console.log('paymentId',paymentId);

  const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": "25.00"
        }
    }]
  };

  paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
    if (error) {
        console.log(error.response);
        throw error;
    } else {
        console.log(JSON.stringify(payment));
        res.redirect('/orders');
    }
});
}


exports.getOrderCancel = (req, res, next) => {
 console.log('cancel');
}



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


exports.getCheckout2 = (req, res, next) => {
  req.user
    .populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      let total = 0;
      products.forEach(p => {
        total += p.quantity * p.productId.price;
      });
      res.render('shop/checkout2', {
        path: '/checkout2',
        pageTitle: 'checkout2',
        products: products,
        totalSum: total,
        isAuthenticated: req.session.isLoggedIn  
      });
    })
    .catch(err => console.log(err));

};