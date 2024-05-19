const User = require("../models/User.js");

const router = require("express").Router();
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//REGISTER USER

router.post("/register", async (req, res) => {
  console.log("chequei no register");

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

router.post("/login", async (req, res) => {

    console.log("login init .....")

  const email = req.body.email;
  const password = req.body.password;

  console.log("Email", email)
  console.log("Passord", password)

  try {
    const user = await User.findOne({ email: email });
   

    if (!user) {
      return res.status(404).send("Usuário não encontrado");
    }

   

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.PASS_SECRET);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

    console.log(user);
    console.log("Hash da senha: ", password)
    console.log("Senha decrypt: ", decryptedData)


    if (password === decryptedData) {
      const token = jwt.sign(

        {
          userId: user._id,
          isAdmin: user.isAdmin,
          data_criacao_utc: new Date(),
        },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Adicionando o token JWT como um cookie na resposta
      res.cookie("jwtToken", token, {
        maxAge: 3600000, // Tempo de vida do cookie em milissegundos (1 hora)
        httpOnly: true, // Define se o cookie é acessível apenas pelo servidor
      });

      console.log("quase!!")
      res.send("User logged in!!");
    } else {
      
      return res.status(401).send("Invalid password")
    }
  } catch (error) {
    res.send(error);
  }
});

module.exports = router;
