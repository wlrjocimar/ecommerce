const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
dotenv.config();

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("DBConnection successful!!")
}).then(()=>{
    console.log("If connection successful then i run!!")
}).catch((err)=>{
    console.log("Authentication failed :",err.errmsg)

})



app.get("/api/test", (req, res) => {
    console.log("Test successful");
    console.log("Headers received", req.headers);
    
    const token = jwt.sign({ userId: '123' }, 'suaChaveSecretaMudarValorEcolocarNoEnv', { expiresIn: '1h' });

    // Adicionando o token JWT como um cookie na resposta
    res.cookie('jwtToken', token, { 
        maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
        httpOnly: true // Define se o cookie é acessível apenas pelo servidor
    });
    
    res.status(200).json({ result: "ok" });
});




app.listen(5000,()=>{
    console.log("Backend server is running!!")
})