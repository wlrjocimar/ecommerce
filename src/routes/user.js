const router = require("express").Router();
const { json } = require("express");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const { verifyToken, verifyTokenAndAuthorization } = require("../utils/verifyToken");
const User = require("../models/User.js");

router.get("/", (req, res) => {
  console.log("Test successful");
  console.log("Headers received", req.headers);

  const token = jwt.sign(
    { userId: "123", teste: "batata 2","data_criacao_utc":new Date() },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  // Adicionando o token JWT como um cookie na resposta
  res.cookie("jwtToken", token, {
    maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
    httpOnly: true, // Define se o cookie é acessível apenas pelo servidor
  });

  res.status(200).json({ result: "ok" });
});

router.get("/test", (req, res) => {
  // Extrair o token do cookie

  if (req.headers.cookie === undefined) {
    res.status(401).json("User not authenticated!!");
  }

  const token = req.headers.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("jwtToken="))
    .split("=")[1];

  console.log(token);

  // Verificar se o token está presente
  if (!token) {
    return res.status(401).json({ message: "Token não fornecido" });
  }
  console.log(req.headers["x-forwarded-proto"]);

  if (req.headers["x-forwarded-proto"] !== "https") {
    return res
      .status(403)
      .json({ message: "Acesso permitido apenas por HTTPS" });
  }

  try {
    // Verificar se o token é válido usando o segredo do .env
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Se o token for válido, você pode prosseguir com a lógica do seu endpoint
    // Por exemplo, você pode retornar uma resposta bem-sucedida
    res.json({ message: "Token válido. Você pode acessar este recurso." });
  } catch (err) {
    // Se houver algum erro ao verificar o token, provavelmente é inválido ou expirado
    return res.status(401).json({ message: "Token inválido" });
  }
});



router.post("/userposttest",(req,res)=>{

    console.log(req.body.username)

    res.send(req.body.username);

    

})

router.put("/:id",verifyTokenAndAuthorization, async(req,res)=>{

  console.log("passed by verify authorization")

  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString();
  }

  console.log("Here")

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      {
        $set: req.body,
      },
      { new: true }
    );
console.log(updatedUser);

    res.status(200).json(updatedUser);
  } catch (err) {
    console.log("Ops", err.message)
    res.status(500).json(err.message);
  }

});



router.delete("/:id",verifyTokenAndAuthorization,async (req,res)=>{

    try {

      const existUser = await User.findById(req.params.id);

      if(!existUser){
        return res.status(404).send("User not found to delete!!")
      }

      await User.findByIdAndDelete(req.params.id)
      res.status(204).json("User has been deleted")
      
    } catch (error) {
      res.status(500).send("Error when deleting user!!" + error.message)
    }

});



module.exports = router;
