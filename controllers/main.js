

exports.getIndex = (req,res,next)=>{
    res.render("main/index", { pageTitle: "Home", path:'/' });
}
;exports.getFindFood = (req,res,next)=>{
    res.render("main/findfood", { pageTitle: "Find Food", path: "/findfood" });
};