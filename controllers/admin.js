const Product = require('../models/product');
const Category = require('../models/category');
const s3 = require('../config/s3.config.js');
const uuid=require('uuid/v1'); 


exports.getCategories = (req, res, next) => {
  Category.find()
  .then(categories =>{
    res.render('admin/categories', {
      categories: categories,
      pageTitle: 'Admin Categories',
      path: '/admin/categories',
      isAuthenticated: req.session.isLoggedIn
  });
  })
  .catch(err => console.log(err)); 
};


exports.getAddCategory = (req, res, next) => {  
  res.render('admin/add-category', {
    pageTitle: 'Add Category',
    path: '/admin/add-category',
    isAuthenticated: req.session.isLoggedIn
  });
};



exports.postAddCategory = (req, res, next) => {

  var title = req.body.title;
  var slug = title.replace(/\s+/g, '-').toLowerCase();


  Category.findOne({slug: slug}, function (err, category) {
    if (category) {
      res.redirect('/admin/categories');
      console.log("duplicate categories");
    } else {
        const category = new Category({
            title: title,
            slug: slug
        });

        category
        .save()
        .then(result => {
          // console.log(result);
          console.log('Created category');
          res.redirect('/admin/categories');
        })
        .catch(err => {
          console.log(err);
        });    
    }

  });

  };




exports.getAddProduct = (req, res, next) => {  
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    isAuthenticated: req.session.isLoggedIn
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
 
  const price = req.body.price;
  const description = req.body.description;

	const s3Client = s3.s3Client;
	const params = s3.uploadParams;

  let name= uuid();
	params.Key = name+req.file.originalname;
	params.Body = req.file.buffer;

	s3Client.upload(params, (err, data) => {
		if (err) {
			res.status(500).json({error:"Error -> " + err});
		}
        console.log('File uploaded to S3 successfully!');


  const product = new Product({
    title,
    price,
    description,
    image:'https://s3.amazonaws.com/emily-project-123/'+params.Key,
    userId: req.user
  });

  product
    .save()
    .then(result => {
      // console.log(result);
      console.log('Created Product');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
  });
 
};



exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }
      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product: product,
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  Product.findById(prodId)
    .then(product => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;
      return product.save();
    })
    .then(result => {
      console.log('UPDATED PRODUCT!');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then(products => {
      console.log(products);
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products',
        isAuthenticated: req.session.isLoggedIn
      });
    })
    .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndRemove(prodId)
    .then(() => {
      console.log('DESTROYED PRODUCT');
      res.redirect('/admin/products');
    })
    .catch(err => console.log(err));
};