const router = require("express").Router();
const { json } = require("express");
const jwt = require("jsonwebtoken");
const CryptoJS = require("crypto-js");
const {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} = require("../utils/verifyToken");
const User = require("../models/User.js");



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

router.post("/userposttest", (req, res) => {
  console.log(req.body.username);

  res.send(req.body.username);
});

router.put("/:id", verifyTokenAndAuthorization, async (req, res) => {
  console.log("passed by verify authorization");

  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SECRET
    ).toString();
  }

  console.log("Here");

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
    console.log("Ops", err.message);
    res.status(500).json(err.message);
  }
});

router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    const existUser = await User.findById(req.params.id);

    if (!existUser) {
      return res.status(404).send("User not found to delete!!");
    }

    await User.findByIdAndDelete(req.params.id);
    res.status(204).json("User has been deleted");
  } catch (error) {
    res.status(500).send("Error when deleting user!!" + error.message);
  }
});

router.get("/:id", verifyTokenAndAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;

    res.status(200).send(others);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

router.get("/", verifyTokenAndAdmin, async (req, res) => {

  const query = req.query.new;
  console.log(query)

  try {
    const users = query ? await User.find().sort({ _id: -1 }).limit(1) : await User.find();
    //const { password, ...others } = user._doc;

    const usersWithoutPassord = users.map((user) => {
      const { password, ...userWhithoutPassord } = user._doc;
      return userWhithoutPassord;
    });

    res.status(200).send(usersWithoutPassord);
  } catch (error) {
    res.status(500).send(error.message);
  }
});



//GET USER STATS

router.get("/stats", verifyTokenAndAdmin, async (req, res) => {


  try {


    const date = new Date();
    const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);



    res.status(200).json(data)
  } catch (err) {
    console.log("Erro", err)

    res.status(500).json(err.message);
  }
});

module.exports = router;
