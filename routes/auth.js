//import
const express = require('express');
const { body } = require('express-validator')

//internal files
const authController = require('../controllers/auth');

const router = express.Router();

//path 
router.get('/signup',authController.getSignup);

router.post(
  "/signup",
  [
    body("email", "Please enter a valid email !").isEmail().normalizeEmail(),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must have atleast 5 or more character long !").trim(),
    body('confirm_password').trim().custom((value,{req})=>{
        if(value !== req.body.password){
            return Promise.reject('Passwords must be same !');
        }
    })
  ],
  authController.postSignup
);



//export route 
module.exports = router;