//============ Database Connection Module ==========
const db = require("../config/database");
const email = require("../config/email");

async function login(req, res) { 
    res.status(200).json({
        success:true,
        message:"Login Success",
        student:{
            name:"avikesh kumar",
            email:"avikeshk47",
        }
    });
}


module.exports={
    login,
}

// Some Database Books Referes by heemani ma'am => navathe, korth, balaguruSwami;