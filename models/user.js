const getDb = require('../utils/database').getDb;

class User {
    constructor(email,password,userType){
        this.email = email;
        this.password = password;
        this.userType = userType;
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
}

module.exports = User;