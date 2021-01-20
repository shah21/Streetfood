//import
const express = require('express');

//internal files
const mainController = require('../controllers/main');

const router = express.Router();

//routes
router.get('/',mainController.getIndex);
router.get('/findfood',mainController.getFindFood);



//export route 
module.exports = router;