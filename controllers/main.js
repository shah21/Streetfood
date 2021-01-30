const Food = require('../models/food');
const User = require('../models/user');
const Order = require('../models/order');

const stripe = require('stripe')('sk_test_51IAYLwKM4w4fU0sk7m3Z5vGnwtjNzrOFJGjVmtdQINsVO8ApWWyvdimZCgdDbYkmL0awMMrEEb7KwEo32uAq0c3A004pRPeWYl');
const ObjectId = require('mongodb').ObjectID;
const pdfDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const { validationResult } = require('express-validator') 
//constants
const ITEM_PER_PAGE = 2;

exports.getIndex = (req,res,next)=>{
    const page = +req.query.page || 1;
    let totalItems;

    Food.getItemsCount().then(count=>{
        totalItems = count;
        return Food.getFoodsWithHotel(page,ITEM_PER_PAGE);
    }).then(foods=>{
        res.render("main/index", { 
                    pageTitle: "Home",
                    path: "/",
                    items:foods,
                    totalItems:totalItems,
                    hasNextPage:page * ITEM_PER_PAGE < totalItems,
                    hasPrevPage:page > 1,
                    nextPage:page+1,
                    prevPage:page-1,
                    currentPage:page,
                    lastPage:Math.ceil(totalItems/ITEM_PER_PAGE)
                });
    }).catch(err=>{

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

exports.getCheckout = (req,res,next)=>{
    User.getCartItems(req.user._id).then((data) => {
        const cart = data[0];
        const items = cart.items;
        return stripe.checkout.sessions.create({
            payment_method_types:['card'],
            line_items:items.map(i=>{
                return{
                    name:i.food.food_name,
                    description:i.food.food_description,
                    amount:i.food.food_price * 100,
                    currency:'inr',
                    quantity:i.quantity,
                }
            }),
            mode:'payment',
            success_url:req.protocol + '://' + req.get('host') + '/checkout/success',
            cancel_url:req.protocol + '://' + req.get('host') + '/checkout/cancel',
        }).then(session=>{
            res.render("main/checkout", {
                pageTitle: "Checkout",
                path: "/checkout",
                items: items,
                totalSum:cart.total,
                sessionId:session.id,
              });
        });
    }).catch((err) => {
        throw new Error(err);
    });
};

exports.getInvoice = (req,res,next)=>{
    const orderId = req.params.id;
    const pdfName = 'invoice'+'-'+ orderId +'.pdf';
    const pdfPath = path.join('data','invoices',pdfName)
    Order.getItemsByQuery({_id:new ObjectId(orderId)}).then(data=>{
        const order = data[0];
        if(!order){
            return res.redirect('/');
        }
        
        if(req.user._id.toString() !== order.userId.toString()){
            console.log('not authorized');
            return res.redirect('/');    
        }

        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="' + pdfName + '"'
        );

        const pdf = new pdfDocument();
        pdf.pipe(fs.createWriteStream(pdfPath));
        pdf.pipe(res);
        pdf.fontSize(26).text('Invoice',{
            underline:true,
        });
        pdf.text('---------------------------');
        order.products.forEach(item => {
            pdf.fontSize(14)
                .text(
                    item.food.food_name + '-' + item.quantity + 'x' + item.food.food_price,
                )
        });
        pdf.text('---------------------------');
        pdf.fontSize(20).text(
            'Total price:' + order.total
        )
        pdf.end();

    }).catch(err=>{
        throw new Error(err);
    });
}


exports.getCheckoutSuccess = (req,res,next)=>{
    User.getCartItems(req.user._id).then((data) => {
        const cart = data[0];
        const items = cart.items.map(item=>{
            return {
                quantity:item.quantity,
                food:item.food
            }
        });
        const order = new Order(req.user._id,req.user.email,items,cart.total,Date.now());
        return order.save();
    }).then(result=>{
        const values = {cart:{items:[]}};
        return User.updateById(req.user._id,values);
    }).then(result=>{
        console.log('order placed...');
        console.log('cart items deleted..');
        res.redirect('/orders');
    })
    .catch((err) => {
        throw new Error(err);
    });
}

exports.getOrders = (req,res,next)=>{

    const months = ["January", "February", "March", "April", "May", 
    "June", "July", "August", "September", "October", "November",
     "December"];

    const query = {userId:req.user._id};
    Order.getItemsByQuery(query).then(orders=>{
        
        res.render("main/orders", {
            pageTitle: "Orders",
            path: "/orders",
            orders:orders,
            months:months,
          });
    });
}

exports.getAccount = (req,res,next)=>{
    User.findById(req.user._id).then(user=>{
        res.render("main/account", {
            pageTitle: "Account",
            path: "/account",
            user:user,
          });
    }).catch(err=>{
        throw new Error(err);
    });
}

exports.getDeliveryAddress = (req,res,next)=>{
    User.findById(req.user._id).then(user=>{
        res.render("main/delivery_address", {
            pageTitle: "Delivery Address",
            path: "/delivery-address",
            user:user,
          });
    }).catch(err=>{
        throw new Error(err);
    });
}

exports.getAddDeliveryAddress = (req,res,next)=>{
    const messages = req.flash('error');
    const errors = validationResult(req).array();



    res.render("main/add_delivery_address", {
        pageTitle: "Add Address",
        path: "/add-address",
        error:errors.length > 0 ? errors[0].msg : null,
        validationErrors:errors,
        oldData:{}
      });
}

exports.postAddDeliveryAddress = (req,res,next)=>{
    const name = req.body.name;
    const phone = req.body.phone;
    const pincode = req.body.pincode;
    const address_line1 = req.body.address_line1;
    const address_line2 = req.body.address_line2;
    const landmark = req.body.landmark;
    const city = req.body.city;
    const state = req.body.state;
    const messages = req.flash('error');
    const errors = validationResult(req).array();

    if(errors.length > 0){

        

        return res.render("main/add_delivery_address", {
            pageTitle: "Add Address",
            path: "/add-address",
            errors:errors.length > 0 ? errors[0].msg : null,
            validationErrors:errors,
            oldData:{
                name:name,
                phone:phone,
                pincode:pincode,
                address_line1:address_line1,
                address_line2:address_line2,
                landmark:landmark,
                city:city,
                state:state,
            }
          });
    }

    const address = {
        name:name,
        phone:phone,
        pincode:pincode,
        address_line1:address_line1,
        address_line2:address_line2,
        landmark:landmark,
        city:city,
        state:state,
    };

    const values = {address:[address]};

    User.updateById(req.user._id,values).then(result=>{
        req.flash('success','added new delivery address');
        res.redirect('/account');
    }).catch(err=>{
        throw new Error(err);
    })
    
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
        });
    }).catch(err=>{
        throw new Error(err);
    });
};

