const router = require("express").Router();
const jwt = require('jsonwebtoken');


router.get("/",(req,res)=>{

    console.log("Test successful");
    console.log("Headers received", req.headers);
    
    const token = jwt.sign({ userId: '123',teste:"batata 2" }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Adicionando o token JWT como um cookie na resposta
    res.cookie('jwtToken', token, { 
        maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
        httpOnly: true // Define se o cookie é acessível apenas pelo servidor
    });
    
    res.status(200).json({ result: "ok" });
});


module.exports=router;