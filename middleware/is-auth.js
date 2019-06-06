module.exports =(req,res,next) => {
  if (req.session.isLoggedIn && req.user.admin == 1) {
      console.log("admin");
      next();
  } else {
      return res.redirect('/login');
  }

}