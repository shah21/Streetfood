const getDb = require('../utils/database').getDb;
const ObjectId = require('mongodb').ObjectID;


class Food {
    constructor(food_name,food_description,food_category,food_price,food_image,hotel_id,created){
        this.food_name = food_name;
        this.food_description = food_description;
        this.food_category = food_category;
        this.food_price = food_price;
        this.food_image = food_image;
        this.hotel_id = hotel_id;
        this.created = created;
    }

    save(){
        return getDb().collection('items').insertOne(this);        
    }

    static findById(itemId){
        return getDb().collection('items').findOne({_id:new ObjectId(itemId)});
    }

    static getItems(){
        return getDb().collection('items').find().toArray();
    }

    static getItemsCount(){
        return getDb().collection('items').countDocuments()
    }

    static getItemsByQuery(query){
        return getDb().collection('items').find(query).toArray();
    }

    static updateById(id,values,userId){
        console.log(userId);
        return getDb().collection('items').updateOne({_id:new ObjectId(id),hotel_id:new ObjectId(userId)},{$set:values});
    }

    static deleteById(id,userId){
        return getDb().collection('items').deleteOne({_id:new ObjectId(id),hotel_id:new ObjectId(userId)});
    }

    static getFoodsWithHotel(page,limit){
        return getDb().collection('items').aggregate([
            {
                $lookup :{
                    from:'users',
                    localField:'hotel_id',
                    foreignField: '_id',
                    as:'hotel'
                }
            },
            {
                $skip:((page-1)*limit),
            },
            {
                $limit:limit
            },
        ]).toArray();
    }
}

module.exports = Food;