//import
const express = require('express');

//internal files
const mainController = require('../controllers/main');
const { isAuth } = require('../middlewares/is-auth');

const router = express.Router();

//routes
router.get('/',mainController.getIndex);



//export route 
module.exports = router;