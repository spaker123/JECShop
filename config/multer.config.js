const multer = require('multer');
 
var storage = multer.memoryStorage();
var upload = multer({
    storage: storage,
    limits:{
        fileSize: 1024 * 1024
    }
    });
 
module.exports = upload;