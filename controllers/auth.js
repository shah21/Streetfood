//imports
const {validationResult} = require('express-validator');
const bcrypt = require('bcrypt');
const User = require('../models/user');
const { use } = require('../routes/main');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const aws = require('aws-sdk');
const { ObjectId } = require('mongodb');

// configure AWS SDK
aws.config.loadFromPath('./config.json');

const transporter = nodemailer.createTransport({
    SES: new aws.SES({
        apiVersion: '2010-12-01',
        region: "us-east-2"
    }), 
});

exports.getLogin = (req,res,next)=>{
    const messages = req.flash('error');
    const success_messages = req.flash('success');

    res.render("auth/login", {
      pageTitle: "Login",
      path: "/login",
      success_msg:success_messages.length > 0 ? success_messages[0] : null,
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

exports.getForgotPassword = (req,res,next)=>{
    const messages = req.flash('error');

    res.render("auth/forgot-password", {
      pageTitle: "Forgot Password",
      path: "/forgot-password",
      errors: messages.length > 0 ? messages[0] : null,
      validationErrors:[],
      oldData:{},
    });
};


exports.getResetPassword = (req,res,next)=>{
    const messages = req.flash('error');
    const token = req.params.token;

    const query = {resetToken:token,tokenExpiring:{ $gt: Date.now()}}; 
    User.findByQuery(query).then(user=>{
        if(!user){
            req.flash('error','Unauthorized access');
            return res.redirect('/login');
        }
        res.render('auth/reset_password',{
            pageTitle:'Reset Password',
            path:'/reset',
            userId:user._id,
            errors: messages.length > 0 ? messages[0] : null,
            validationErrors:[],
            oldData:{}
        });
    }).catch(err=>{
        throw new Error(err);
    });
}


exports.getVerifyAccount = (req,res,next)=>{
    const token = req.params.token;
    const query = {accVerifyToken:token}

    User.findByQuery(query).then(user=>{
        if(!user){
            req.flash('error','Unknown token.');
            return res.redirect('/');
        }
        const updateValues = {verified:true};
        User.updateById(user._id,updateValues).then((result) => {
            res.render('auth/verify-account',{
                    pageTitle:'Account Verified',
                    path:'/account-verified',
                    user:user,
            });
        });
    }).catch((err) => {
        throw new Error(err);    
    });
}



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

            if(!user.verified){
                req.flash('error','Please verify your account.Check your email account for verification email');
                return res.redirect('/login')
            }

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
        throw new Error(err);
    });
};

exports.postSignup = (req,res,next) =>{
    const userType = req.body.userType;
    const hotel_name = req.body.hotel_name;
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
                userType:userType,
                hotel_name:hotel_name,
            }
           
        });
    }

    bcrypt.hash(password,12).then((hash) => {
        const newUser = new User(email,hash,userType,hotel_name,Date.now(),{});
        newUser.save().then((result) => {
            console.log('User created..');
            const userId = result.ops[0]._id;
            crypto.randomBytes(32,(err,buffer)=>{
                if(err){
                    return res.redirect('/login');
                }
                const token = buffer.toString('hex');
                const updateValues = {accVerifyToken:token,verified:false};

                User.updateById(userId,updateValues).then(result=>{
                    req.flash('success','Account created successfully. Please verify your account.Check your email account for verification email');
                    res.redirect('/login');
                    transporter.sendMail({
                        from:'muhsinshah21@gmail.com',
                        to:email,
                        subject:'Verify email',
                        html:`
                            <p>Please verify your email</p>
                            <p>click this link to <a href="http://localhost:3000/verify-account/${token}">Link</a> verify your account.</p>
                        `
                    });
                });
            });
        });
    }).catch((err) => {
        throw new Error(err);
    });
};

exports.postLogout = (req,res,next) =>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/')
    });
}

exports.postForgotPassword = (req,res,next) =>{
    const email = req.body.email;

    crypto.randomBytes(32,(err,buffer)=>{
        if(err){
            return res.redirect('/forgot-password');
        }
        const token = buffer.toString('hex');
        User.findByEmail(email).then(user=>{
            if(!user){
                req.flash('error','Email has not an account in streetfood!');
                return res.redirect('/forgot-password');
            }
            const updateValues = {
                resetToken:token,
                tokenExpiring:Date.now() + 3600000,
            }
            return User.updateById(user._id,updateValues);
        }).then(result=>{
            res.redirect('/login');
            transporter.sendMail({
                from:'muhsinshah21@gmail.com',
                to:email,
                subject:'Password reset',
                html:`
                    <p>You are requested for a password reset</p>
                    <p>click this link to <a href="http://localhost:3000/reset/${token}">Link</a> set a new password</p>
                `
            });
        }).catch(err=>{
            console.log(err);
        });
    });
}

exports.postResetPassword = (req,res,next)=>{
    const userId = req.body.id;
    const password = req.body.password;
    const confirm_password = req.body.confirm_password;
    const errors = validationResult(req).array();

    if(errors.length > 0){

        return res.render('auth/reset_password',{
            pageTitle:'Reset Password',
            path:'/reset',
            userId:userId,
            errors: errors[0].msg,
            validationErrors:errors,
            oldData:{
                password:password,
                confirm_password:confirm_password,
            }
        });
    }

    bcrypt.hash(password,12).then(hash=>{
        const updateValues = {password:hash,resetToken:undefined,tokenExpiring:undefined};
        User.updateById(userId,updateValues).then((result) => {
            console.log('Password updated');
            req.flash('success','Password updated successfully');
            res.redirect('/login');
        });
    }).catch((err) => {
        throw new Error(err);        
    });
    
    
};