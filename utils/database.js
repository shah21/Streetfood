const { MongoClient } = require('mongodb');
const mongodb = require('mongodb');

const mongoClient = mongodb.MongoClient;
const DB_URL = "<MongodbUrl>";
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
    throw new Error('No database found!');
};  

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;
exports.DB_URL = DB_URL;

