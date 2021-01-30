//import
const express = require('express');
const {body} = require('express-validator');

//internal files
const mainController = require('../controllers/main');
const { isAuth } = require('../middlewares/is-auth');

const router = express.Router();

//routes
router.get('/',mainController.getIndex);
router.get('/cart',isAuth,mainController.getCart);
router.get('/delivery-address',isAuth,mainController.getDeliveryAddress);
router.get('/checkout',isAuth,mainController.getCheckout);
router.get('/checkout/success',isAuth,mainController.getCheckoutSuccess);
router.get('/checkout/cancel',isAuth,mainController.getCheckout);
router.get('/orders',isAuth,mainController.getOrders);
router.get('/orders/invoice/:id',isAuth,mainController.getInvoice);
router.get('/account',isAuth,mainController.getAccount);
router.get('/add-delivery-address',isAuth,mainController.getAddDeliveryAddress);


router.post('/add-to-cart/',isAuth,mainController.postAddtoCart);
router.delete('/delete-cart-item/:id',isAuth,mainController.deleteCartItem);
router.post('/add-delivery-address',[
    body('name').isLength({min:3}).withMessage('Full name must have atleast 3 characters long!'),
    body('phone').isLength({min:10}).withMessage('Mobile phone number must have atleast 10 digit long!'),
    body('pincode').isLength({min:6}).withMessage('Pincode must have atleast 6 digit long!'),
    body('address_line1').isLength({min:1}).withMessage('Please fill this field'),
    body('city').isLength({min:1}).withMessage('Please enter city name!'),
    body('state').isLength({min:1}).withMessage('Please enter state name!'),
],isAuth,mainController.postAddDeliveryAddress);



//export route 
module.exports = router;