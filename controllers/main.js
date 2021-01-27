const Food = require('../models/food');
const User = require('../models/user');
const ObjectId = require('mongodb').ObjectID;

exports.getIndex = (req,res,next)=>{
    Food.getFoodsWithHotel().then(foods=>{
        res.render("main/index", { 
            pageTitle: "Home",
            path: "/",
            items:foods,
        });
    });
};

exports.getCart = (req,res,next)=>{

    User.getCartItems(req.user._id).then(data=>{
        const cart = data[0];
       
        res.render("main/cart", { 
            pageTitle: "Cart",
            path: "/cart",
            cart:cart ? cart : {items:[]},
        }); 
    }).catch(err=>{
        throw new Error(err);
    });
}

exports.postAddtoCart = (req,res,next)=>{
    const itemId = new ObjectId(req.body.itemId);

    Food.findById(req.body.itemId).then(item=>{
        if(!item){
            return res.redirect('/');
        }
        const query = {"cart.items.foodId": itemId};
        User.findByQuery(query).then(user=>{
            let quantity = 1;
            
            if(user){
                //if user existed with above cart item then fetch cartItem from items
                //and update cart
                const cartItem = user.cart.items.find(x=> x.foodId.toString() === itemId.toString());
                quantity = cartItem.quantity + 1;
                const values = {"cart.items.$.quantity":quantity};
                return User.updateCart(req.user._id,itemId,values).then(result=>{
                    console.log('Cart item updated');
                    res.redirect('/cart');
                });
            }
            //if food item new to user's cart then add to items array
            const values = {foodId:itemId,quantity:quantity};
            User.addToCart(req.user._id,values).then(result=>{
                console.log('Added to cart');
                res.redirect('/cart');
            });
        });
    }).catch(err=>{ 
        throw new Error(err);
    });
};


exports.deleteCartItem= (req,res,next)=>{
    const itemId = req.params.id;
    User.findById(req.user._id).then(user=>{
        const cartItems = user.cart.items;
        console.log("itemId",itemId);
        const updatedCart = cartItems.filter(x=>{
            return x.foodId.toString() !== itemId.toString();
        });
        console.log(updatedCart);
        const values = {'cart.items':updatedCart};
        User.updateById(req.user._id,values).then(result=>{
            User.getCartItems(req.user._id).then((data) => {
                const cart = data[0];
                res.status(200).json({message:"suceess",total:cart ? cart.total : 0})
            });
        }).catch(err=>{
            throw new Error(err);
        });
    });
};