

exports.getIndex = (req,res,next)=>{
    res.render("main/index", { pageTitle: "Home" });
};