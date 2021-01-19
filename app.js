//external modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
//internal files
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');

//contants
const DB_URL = "mongodb+srv://shah:24rnVNb9dX9KxMZ@cluster0.49ooy.mongodb.net/streetfood?retryWrites=true&w=majority";

//express app
const app = express();

//set views path and template engine
app.set('view engine','ejs');
app.set('views','views');

//set public files accessible to ejs 
app.use(express.static(path.join(__dirname,'public')));

//set body parser
app.use(express.urlencoded({extended:false})); 


//routes
app.use(mainRouter);
app.use(authRouter);

//getting connection to db
mongoose.connect(DB_URL).then(result=>{
    console.log('==================')
    console.log('DB Connected')
    //starting server
    app.listen(3000,()=>{
        console.log("Server running....");
        console.log('==================')
    });
}).catch(err=>{
    console.log(err);
});




