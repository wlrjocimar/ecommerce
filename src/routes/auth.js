const User = require("../models/User.js");

const router = require("express").Router();


//REGISTER USER

router.post("/register",async (req,res)=>{

    console.log("chequei no register")

    const newUser = new User({
        username:req.body.username,
        email:req.body.email,
        password:req.body.password
    })

    try {
    const userSaved = await newUser.save();
    res.status(201).json(userSaved);
    } catch (error) {
        
        res.status(500).json("Something went Wrong :" + error.message);
    }

    


})

















module.exports=router;