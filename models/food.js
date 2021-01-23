const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectID;

class Food {
    constructor(food_name,food_description,food_category,food_price,food_image,hotel_id){
        this.food_name = food_name;
        this.food_description = food_description;
        this.food_category = food_category;
        this.food_price = food_price;
        this.food_image = food_image;
        this.hotel_id = hotel_id;
    }

    save(){
        return getDb().collection('items').insertOne(this);        
    }

    static findById(itemId){
        return getDb().collection('items').findOne({_id:new ObjectId(itemId)});
    }

    static getAllItems(){
        return getDb().collection('items').find().toArray();
    }

    static updateById(id,values){
        return getDb().collection('items').updateOne({_id:new ObjectId(id)},{$set:values});
    }
}

module.exports = Food;