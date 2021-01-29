//external modules
const express = require('express');
const path = require('path');
const session = require('express-session');
const MongoDBStore  = require('connect-mongodb-session')(session);
const flash = require('connect-flash');
const multer = require('multer');
const csurf = require('csurf');
//internal files
const mongoConnect = require('./utils/database').mongoConnect;
const DB_URL = require('./utils/database').DB_URL;
const mainRouter = require('./routes/main');
const authRouter = require('./routes/auth');
const hotelRouter = require('./routes/hotel');
const User = require('./models/user');
const errorController = require('./controllers/error');


const csrfProtection = csurf();
//express app
const app = express();
//mongodb store for storing session on db
const store = new MongoDBStore({
    uri:DB_URL,
    collection:'sessions'
});

//file storage configuration 
const fileStorage = multer.diskStorage({
    destination:(req,file,cb)=>{
        cb(null,'images');
    },
    filename:(req,file,cb)=>{
        cb(null, Date.now() +'-'+ file.originalname);
    }
});
  
  
  //file type checking 
  const fileFilter = (req, file, cb) => {
    if (
      file.mimetype === 'image/png' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/jpeg'
    ) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  };
  
//set views path and template engine
app.set('view engine','ejs');
app.set('views','views');

//set body parser
app.use(express.urlencoded({extended:false})); 
//set middleware for extract files or binary data from requests
app.use(
  multer({ storage:fileStorage,fileFilter:fileFilter }).single("image")
);
//set public files accessible to ejs 
app.use(express.static(path.join(__dirname,'public')));
app.use('/images',express.static(path.join(__dirname,'images')));
//initialize session middleware
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

//csrf protection middleware
app.use(csrfProtection);

//store flash messages accross requests
app.use(flash());
//set locals for ejs
app.use((req,res,next)=>{
    res.locals.userLoggedIn = req.session.userLoggedIn;
    res.locals.csrfToken = req.csrfToken();
    next();  
});

app.use((req,res,next)=>{
    if(!req.session.user){
        return next();
    }
    User.findById(req.session.user._id).then((user) => {
        if(!user){
            return next();
        }
        req.user = user;
        res.locals.userType = user.userType;
        next();
    }).catch((err) => {
        throw new Error(err);
    });
});


//routes
app.use(mainRouter);
app.use(authRouter);
app.use(hotelRouter);
app.use('/500',errorController.get500);
app.use(errorController.get404);


// app.use((error,req,res,next)=>{
//     res.redirect('/500');
// })

//getting connection to db
mongoConnect(()=>{
    app.listen(3000);
    console.log('Server running....');
});





