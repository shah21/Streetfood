//imports
const {validationResult} = require('express-validator');

exports.getSignup = (req,res,next)=>{
    res.render("auth/signup", { pageTitle: "Signup", path: "/signup",errors:null });
};

exports.postSignup = (req,res,next) =>{
    const userType = req.body.userType;
    const email = req.body.email;
    const password = req.body.password;
    const confirm_passwrod = req.body.confirm_passwrod;
    const errors = validationResult(req).array();
    
    if(errors){
        return res.status(422).render('auth/signup',{
            pageTitle: "Signup",
            path: "/signup",
            errors:errors[0].msg,
            validationErrors:errors,
        })
    }
};
