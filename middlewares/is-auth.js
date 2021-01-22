exports.isAuth = (req,res,next)=>{
    if(!req.session.userLoggedIn){
        return res.redirect('/login');
    }
    next();
};

exports.isHotelUser =  (req,res,next)=>{
    if(req.user.userType !== 'hotel'){
        return res.redirect('/');
    }
    next();
};