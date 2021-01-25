const Food = require('../models/food');
const User = require('../models/user');

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
    res.render("main/cart", { 
        pageTitle: "Cart",
        path: "/cart",
    });
}

exports.postAddtoCart = (req,res,next)=>{
    const itemId = req.body.itemId;

    Food.findById(itemId).then(item=>{
        if(!item){
            return res.redirect('/');
        }
        const query = {"cart.items.foodId":itemId};
        User.findByQuery(query).then(user=>{
            let quantity = 1;
            
            if(user){
                //if user existed with above cart item then fetch cartItem from items
                //and update cart
                const cartItem = user.cart.items.find(x=> x.foodId === itemId);
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