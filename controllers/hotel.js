const Food = require('../models/food');
const {validationResult} = require('express-validator');

exports.getManageFoods = (req,res,next)=>{
    const messages = req.flash('error');
    const success_msg = req.flash('success');

    Food.getAllItems().then(items=>{
        if (items) {
          res.render("hotel/manage_foods", {
            pageTitle: "Manage Foods",
            path: "/manage-foods",
            items:items,
            errors: messages.length > 0 ? messages[0] : null,
            success_msg: success_msg.length > 0 ? success_msg[0] : null,
            validationErrors: [],
            oldData: {},
          });
        }
    }).catch(err=>{
        console.log(err);
    })

    
}

exports.postAddItem = (req,res,next) =>{
    const food_name = req.body.food_name;
    const food_description = req.body.food_description;
    const food_category = req.body.food_category;
    const food_price = req.body.food_price;
    const hotel_id = req.user._id;
    const food_image = req.file;
    const errors = validationResult(req).array();

    Food.getAllItems().then(items=>{
        if(!food_image){
            return res.status(422).render('hotel/manage_foods',{
                pageTitle: "Manage Foods",
                path: "/manage-foods",
                errors:'Attached file is not an image!',
                success_msg:null,
                items:items,
                validationErrors:errors,
                oldData:{
                    food_name:food_name,
                    food_description:food_description,
                    food_category:food_category,
                    food_price:food_price,
                }
            });
        }
    
        const imgUrl = food_image.path;
        
        if(errors.length > 0){

            console.log(errors);
            return res.status(422).render('hotel/manage_foods',{
                pageTitle: "Manage Foods",
                path: "/manage-foods",
                errors:errors[0].msg,
                success_msg:null,
                items:items,
                validationErrors:errors,
                oldData:{
                    food_name:food_name,
                    food_description:food_description,
                    food_category:food_category,
                    food_price:food_price,
                    food_image:imgUrl,
                }
            });
        }
    
        const newFood = new Food(food_name,food_description,food_category,food_price,imgUrl,hotel_id);
        newFood.save().then((result) => {
            console.log("Item added.");
            req.flash('success',' New food added');
            res.redirect('/manage-foods');
        }).catch((err) => {
            req.flash('error','something went wrong !.try again');
            console.log(err);
        });
    }).catch(err=>{
        console.log(err);
    })

   

};