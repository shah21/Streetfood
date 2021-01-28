//import
const express = require('express');

//internal files
const mainController = require('../controllers/main');
const { isAuth } = require('../middlewares/is-auth');

const router = express.Router();

//routes
router.get('/',mainController.getIndex);
router.get('/cart',isAuth,mainController.getCart);
router.get('/checkout',isAuth,mainController.getCheckout);
router.get('/checkout/success',isAuth,mainController.getCheckoutSuccess);
router.get('/checkout/cancel',isAuth,mainController.getCheckout);
router.get('/orders',isAuth,mainController.getOrders);
router.get('/orders/invoice/:id',isAuth,mainController.getInvoice);


router.post('/add-to-cart/',isAuth,mainController.postAddtoCart);
router.delete('/delete-cart-item/:id',isAuth,mainController.deleteCartItem);



//export route 
module.exports = router;