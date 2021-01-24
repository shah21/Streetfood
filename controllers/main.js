const Food = require('../models/food');
const User = require('../models/user');

exports.getIndex = (req,res,next)=>{
    Food.getFoodsWithHotel().then(foods=>{
        res.render("main/index", { 
            pageTitle: "Home",
            path: "/",
            items:foods,
        });
    })


    
};