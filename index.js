const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const router = express.Router();

const userRouter = require("./routes/user.js")

dotenv.config();

// Defina o basePath, por exemplo, '/api'
const basePath = '/ec-api';

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("DBConnection successful!!")
}).then(()=>{
    console.log("If connection successful then i run!!")
}).catch((err)=>{
    console.log("Authentication failed :",err.errmsg)

})


router.get("/", (req,res)=>{
    res.send("Base application")
});

//midleware
app.use(basePath + "/users", userRouter);



// Aplique o basePath às rotas
//
app.use(basePath, router);




app.listen(5000,()=>{
    console.log("Backend server is running!!")
})


