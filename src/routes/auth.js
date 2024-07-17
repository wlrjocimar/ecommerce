const User = require("../models/User.js");
const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/verifyToken.js");

// Middleware para lidar com dados codificados de formulário
router.use( require("express").urlencoded({ extended: true }));

//GERAR TOKEN DE TESTE
router.get("/gerartoken", (req, res) => {
  const token = jwt.sign(
    { userId: "664a601ed6f1b9b51d308573", isAdmin: true, data_criacao_utc: new Date() },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  // Adicionando o token JWT como um cookie na resposta
  res.cookie("jwtToken", token, {
    maxAge: 2 * 60 * 60 * 1000, // Tempo de vida do cookie em milissegundos (2 horas)
    httpOnly: true, // Define se o cookie é acessível apenas pelo servidor
  });

  res.status(200).json({ result: "You are fake logged in for test!!" });
});

//REGISTER USER
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString(),
  });

  try {
    const userSaved = await newUser.save();
    res.status(201).json(userSaved);
  } catch (error) {
    res.status(500).json("Something went Wrong :" + error.message);
  }
});

//LOGIN
// When Log in , inject the jwt on cookie
router.post("/login", async (req, res) => {
  const email = req.body.email;
  const originalPassword = req.body.password;

  try {
    const user = await User.findOne({ email: email });

    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }
    

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    if (originalPassword === decryptedData) {
      const token = jwt.sign(
        {
          userId: user._id,
          isAdmin: user.isAdmin,
          data_criacao_utc: new Date(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "2h" }
      );

      // Adicionando o token JWT como um cookie na resposta
      res.cookie("jwtToken", token, {
        maxAge: 2 * 60 * 60 * 1000, // Tempo de vida do cookie em milissegundos (2 horas)
        httpOnly: true, // Define se o cookie é acessível apenas pelo servidor
      }).send("User logged in and token injected into a cookie in this domain");
    } else {
      return res.status(401).send("Invalid password");
    }
  } catch (error) {
    res.send(error);
  }
});

router.get("/verifytoken", verifyToken, (req, res, next) => {
  res.send("Verified token");
});


module.exports = router;
