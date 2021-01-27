//import
const express = require('express');

//internal files
const mainController = require('../controllers/main');
const { isAuth } = require('../middlewares/is-auth');

const router = express.Router();

//routes
router.get('/',mainController.getIndex);
router.get('/cart',isAuth,mainController.getCart);


router.post('/add-to-cart/',isAuth,mainController.postAddtoCart);
router.delete('/delete-cart-item/:id',isAuth,mainController.deleteCartItem);



//export route 
module.exports = router;