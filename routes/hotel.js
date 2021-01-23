//external
const express = require('express');
const { body } = require('express-validator');
//internal
const hotelController = require('../controllers/hotel');
const {isAuth,isHotelUser} = require('../middlewares/is-auth');

const router = express.Router();

router.get(
  "/manage-foods",
  isAuth,
  isHotelUser,
  hotelController.getManageFoods
);

router.get(
  "/edit-item/:id",
  isAuth,
  isHotelUser,
  hotelController.getEditItem
);

router.post('/add-item',[
    body('food_name').isLength({min:3}).withMessage('Food name must have atleast 3 characters long!'),
    body('food_description').isLength({min:10}).withMessage('Food description must have atleast 10 characters long!'),
    body('food_category').isLength({min:1}).withMessage('Please enter food category!'),
    body('food_price').isLength({min:1}).withMessage('Please enter food price!').isFloat().withMessage( "Price must be a decimal value!"),
], isAuth,isHotelUser,hotelController.postAddItem);

router.post('/edit-item',[
  body('food_name').isLength({min:3}).withMessage('Food name must have atleast 3 characters long!'),
  body('food_description').isLength({min:10}).withMessage('Food description must have atleast 10 characters long!'),
  body('food_category').isLength({min:1}).withMessage('Please enter food category!'),
  body('food_price').isLength({min:1}).withMessage('Please enter food price!').isFloat().withMessage( "Price must be a decimal value!"),
],hotelController.postEditItem);

router.delete('/delete-item/:id',isAuth,isHotelUser,hotelController.deleteItem);


module.exports = router;