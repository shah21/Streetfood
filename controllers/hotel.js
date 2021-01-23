const Food = require('../models/food');
const {validationResult} = require('express-validator');
const { fileRemover } = require('../utils/file');

exports.getManageFoods = (req,res,next)=>{
    const messages = req.flash('error');
    const success_msg = req.flash('success');

    Food.getAllItems().then(items=>{
        if (items) {
          res.render("hotel/manage_foods", {
            pageTitle: "Manage Foods",
            path: "/manage-foods",
            editting:false,
            items:items,
            errors: messages.length > 0 ? messages[0] : null,
            success_msg: success_msg.length > 0 ? success_msg[0] : null,
            validationErrors: [],
            oldData: {},
          });
        }
    }).catch(err=>{
        throw new Error(err);
    })
}

exports.getEditItem = (req,res,next)=>{
    const itemId = req.params.id;
    

    Food.findById(itemId).then(item=>{
        if (item) {
            return res.status(200).json({item:item,editting:true});
        }
    }).catch(err=>{
        throw new Error(err);
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
            throw new Error(err);
        });
    }).catch(err=>{
        throw new Error(err);
    });

   

};


exports.postEditItem = (req,res,next) =>{
    const food_name = req.body.food_name;
    const food_description = req.body.food_description;
    const food_category = req.body.food_category;
    const food_price = req.body.food_price;
    const food_image = req.file;
    const food_id = req.body.id;
    const errors = validationResult(req).array();

    Food.getAllItems().then(items=>{

        Food.findById(food_id).then(food=>{
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
                        food_name1:food_name,
                        food_description1:food_description,
                        food_category1:food_category,
                        food_price1:food_price,
                    }
                });
            }
    
            const updatedValues = {
                food_name:food_name,
                food_description:food_description,
                food_category:food_category,
                food_price:food_price,
            };
    
            if(food_image){
                fileRemover(food.food_image);
                updatedValues['food_image'] = food_image.path;
            }
    
            return Food.updateById(food_id,updatedValues,req.user._id).then((result) => {
                console.log("Item updated.");
                req.flash('success','Food item updated');
                res.redirect('/manage-foods');
            });
        });
    }).catch((err) => {
        req.flash('error','something went wrong !.try again');
        throw new Error(err);
    });
};


exports.deleteItem = (req,res,next)=>{
    const id = req.params.id;

    Food.findById(id).then(item=>{
        fileRemover(item.food_image);
        Food.deleteById(id,req.user._id).then(result=>{
            console.log('Food item deleted ');
            return res.status(200).json({'message':'success'})
        });
    }).catch(err=>{
        throw new Error(err);
    });

    
};