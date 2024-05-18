const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const router = express.Router();

const userRouter = require("./src/routes/user.js")
const authRouter = require("./src/routes/auth.js")

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
app.use(express.json());

router.get("/", (req,res)=>{
    res.send("Base application")
});

//midleware
app.use(basePath + "/users", userRouter);
app.use(basePath + "/auth", authRouter);



// Aplique o basePath às rotas
//
app.use(basePath, router);




app.listen(5000,()=>{
    console.log("Backend server is running!!")
})


