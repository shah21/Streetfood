const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectID;

class User {
    constructor(email,password,userType,hotel_name,cart){
        this.email = email;
        this.password = password;
        this.userType = userType;
        this.hotel_name = hotel_name;
        this.cart = cart;
    }

    save(){
        return getDb().collection('users').insertOne(this);
    }

    static addToCart(userId,values){
        return getDb().collection('users').updateOne({_id:new ObjectId(userId)},{$push:{"cart.items":values}});
    }

    static updateCart(userId,itemId,values){
        return getDb().collection('users').updateOne(
            {_id:new ObjectId(userId),"cart.items.foodId":itemId},
            {$set:values}
        );
    }

    static findById(userId){
        return getDb().collection('users').findOne({_id:userId});
    }

    static findByEmail(email){
        return getDb().collection('users').findOne({email:email});
    }

    static updateById(id,values){
        return getDb().collection('users').updateOne({_id:new ObjectId(id)},{$set:values});
    }

    static findByQuery(query){
        return getDb().collection('users').findOne(query);
    }

    static findCartItemByQuery(query){
        return getDb().collection('users').find(
            query,
        ).project({'cart.items.$':1}).toArray();
    }
}

module.exports = User;