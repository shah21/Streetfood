//import
const express = require('express');
const { body } = require('express-validator');


//internal files
const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

//path 
router.get('/login',authController.getLogin);
router.get('/signup',authController.getSignup);

router.post(
  "/login",
  [
    body("email","Please enter a valid email !").isEmail().normalizeEmail().custom((value,{req})=>{
      return User.findByEmail(value).then((user) => {
        if(!user){
          return Promise.reject('There is no account in these email!, please register one');
        }
      });
    }),
    body("password","Please enter password").isLength({min:1}).trim()
  ],
  authController.postLogin
);

router.post(
  "/signup",
  [
    body("email","Please enter a valid email !").isEmail().normalizeEmail().custom((value,{req})=>{
      return User.findByEmail(value).then((user) => {
        if(user){
          return Promise.reject('Email already exists!. Pick another one');
        }
      });
    }),
    body("password")
      .isLength({ min: 5 })
      .withMessage("Password must have atleast 5 or more character long !").trim(),
    body('confirm_password').trim().custom((value,{req})=>{
        if(value !== req.body.password){
            return Promise.reject('Passwords must be same !');
        }
        return true;
    })
  ],
  authController.postSignup
);

router.post('/logout',authController.postLogout);



//export route 
module.exports = router;