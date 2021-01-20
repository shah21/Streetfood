const { MongoClient } = require('mongodb');
const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;
const DB_URL = "mongodb+srv://shah:24rnVNb9dX9KxMZ@cluster0.49ooy.mongodb.net/streetfood?retryWrites=true&w=majority";
let _db;

const mongoConnect = (callback) =>{
    mongoClient.connect(DB_URL, { useUnifiedTopology: true }).then(client=>{
        console.log('Connected');
        _db = client.db();
        callback();
    }).catch(err=>{
        console.log(err);
    });
};

const getDb = ()=>{
    if(_db){
        return _db;
    }
    throw 'No database found!';
};  

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
exports.DB_URL = DB_URL;

