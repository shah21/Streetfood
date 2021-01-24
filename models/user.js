const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectID;

class User {
    constructor(email,password,userType,hotel_name){
        this.email = email;
        this.password = password;
        this.userType = userType;
        this.hotel_name = hotel_name;
    }

    save(){
        return getDb().collection('users').insertOne(this);
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
}

module.exports = User;