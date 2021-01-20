//imports
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { use } = require('../routes/main');

exports.getLogin = (req,res,next)=>{
    const messages = req.flash('error');

    res.render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      errors: messages.length > 0 ? messages[0] : null,
      validationErrors:[],
      oldData:{},
    });
};

exports.getSignup = (req,res,next)=>{
    res.render("auth/signup", {
      pageTitle: "Signup",
      path: "/signup",
      errors: null,
      validationErrors:[],
      oldData:{},
    });
};

exports.postLogin = (req,res,next)=>{
    const email = req.body.email;
    const password = req.body.password;
    const errors = validationResult(req).array();

    if (errors.length > 0) {
      res.render("auth/login", {
        pageTitle: "Login",
        path: "/login",
        errors: errors[0].msg,
        validationErrors: errors,
        oldData: {
            email:email,
            password:password,
        },
      });
    }

    User.findByEmail(email).then((user) => {
        if(user){
            bcrypt.compare(password,user.password).then(match=>{
                if(match){
                    req.session.userLoggedIn = true;
                    req.session.user = user;
                    return req.session.save(err=>{
                        if(!err){
                            console.log('User logged in..');
                            res.redirect('/')
                        }
                    });
                }
                req.flash('error','Invalid password')
                res.redirect('/login')
            });
        }
    }).catch((err) => {
        console.log(err);
    });
};

exports.postSignup = (req,res,next) =>{
    const userType = req.body.userType;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const errors = validationResult(req).array();

    
    if(errors.length > 0){
        console.log(errors);
        return res.status(422).render('auth/signup',{
            pageTitle: "Signup",
            path: "/signup",
            errors:errors[0].msg,
            validationErrors:errors,
            oldData:{
                email:email,
                password:password,
                confirm_password:confirm_password,
            }
        });
    }

    bcrypt.hash(password,12).then((hash) => {
        const newUser = new User(email,hash,userType);
        newUser.save().then((result) => {
            console.log('User created..');
            res.redirect('/login');
        })
    }).catch((err) => {
        console.log(err);
    });
};

exports.postLogout = (req,res,next) =>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/')
    });
}