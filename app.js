//external modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore  = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
//internal files
const mongoConnect = require('./utils/database').mongoConnect;
const DB_URL = require('./utils/database').DB_URL;
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');




//express app
const app = express();
//mongodb store for storing session on db
const store = new MongoDBStore({
    uri:DB_URL,
    collection:'sessions'
});

//set views path and template engine
app.set('view engine','ejs');
app.set('views','views');

//set public files accessible to ejs 
app.use(express.static(path.join(__dirname,'public')));
//set body parser
app.use(express.urlencoded({extended:false})); 
//initialize session middleware
app.use(
  session({ secret: "my secret", resave: false, saveUninitialized: false,store:store })
);
//store flash messages accross requests
app.use(flash());
//set locals for ejs
app.use((req,res,next)=>{
    res.locals.userLoggedIn = req.session.userLoggedIn;
    res.locals.userType = req.session.user.userType;
    next();
});


//routes
app.use(mainRouter);
app.use(authRouter);


//getting connection to db
mongoConnect(()=>{
    app.listen(3000);
    console.log('Server running....');
});





