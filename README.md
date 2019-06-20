# Welcome to Node-JECShop Project #

Node- JECShop is a responsive e-shopping application using *Node.js, Express.js,
ejs, HTML, CSS, Javascript, MongoDB, Mongoose, AWS, Bootstrap 4*

## Main Features ##

* The application includes authentication and role based access control-user and admin. 

* The application serves as a content management system for the admin have CRUD functions to add, edit, delete the products. A dashboard for the admin to focus on important factors of sales management.

* The end user can view the product as either an anonymous user or an authenticated user with a valid account.

* The end user can add the products they like in the shopping cart, and create an order.

* The payment services are supported in this application, including Stripe and Paypal.

* The product recommedation feature is supported in this application based on Apache Spark collaborative filtering (alternating least squares (ALS) algorithm) with users' explicit and implicit feedback/ratings. 

* The reommedation feature is designed to use **REST API** to `pull` the recommedation data from `Amazon API Gateway`.

* The API retrieves the parameters and triggers `the Lambda function`, and the Lambda function query/scan `the DynamoDB table` based on the request parameter.

* The DynamoDB table stores the customers' purchase history and rating records, and another table stores the ALS recommendation relevance for each user. The update frequecy of the recommedation calculation is per hour from the `CloudWatch` cron scheduler to trigger a Lambda function and run the spark ALS algorithm on the EMR cluster to generate the user product matrix model with the recommendation relevance.

* The application is responsive web design (RWD) that makes web pages render well on a variety of devices and window or screen sizes.


## Instructions ##
1. Download all files
2. Install packages: `npm install`
3. Change out the database configuration in config folder
4. To run the app, type `npm start`
6. Visit in your browser at: `http://localhost:3000`


## Contact info ##
*Author:* Emily Lu

*Email:* emilylu840819@gmail.com
