const fs = require('fs');

exports.fileRemover = (path) =>{
    fs.unlink(path,(err)=>{
        if(err){
            throw new Error(err);
        }
    });

}