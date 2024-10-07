const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const unsecurityRoutes  = express.Router();
const secureRoutes  = express.Router();

const cookieParser = require('cookie-parser');
const cors = require('cors');
const path = require('path');

const userRouter = require("./src/routes/user.js")
const authRouter = require("./src/routes/auth.js");
const productRouter = require("./src/routes/product.js");
const cartRouter = require("./src/routes/cart.js");
const orderRouter = require("./src/routes/order.js");
const stripeRouter = require("./src/routes/stripe.js");
const testeRouter = require("./src/routes/teste.js");
const { revalidateToken } = require("./src/utils/verifyToken.js");

dotenv.config();

// Permitir todas as origens
app.use(cors());

app.use(express.static('public'))
// Servir arquivos estáticos
app.use('/ec-api/css', express.static(path.join(__dirname, 'public/css')));
app.use('/ec-api/js', express.static(path.join(__dirname, 'public/js')));

// Rota para servir o arquivo HTML
unsecurityRoutes.get('/stripe', function(req, res) {
    // Não é necessário renderizar nada, apenas enviar o arquivo HTML como resposta
    res.sendFile(__dirname +  '/public/index.html');
});


// Configurar o cookie-parser como middleware
app.use(cookieParser());
// Defina o basePath, por exemplo, '/api'
const basePath = '/ec-api';

// Middleware global para revalidação de token
//app.use(revalidateToken);  poderia ser um outro midleware global qualquer

mongoose.connect(process.env.MONGO_URL)
.then(()=>{
    console.log("DBConnection successful!!")
}).then(()=>{
    console.log("If connection successful then i run!!")
}).catch((err)=>{
    console.log("Authentication failed :",err.errmsg)

})
app.use(express.json());
secureRoutes.use(express.json());
unsecurityRoutes.use(express.json());



//midleware
//secureRoutes.use(revalidateToken);
secureRoutes.use("/users", userRouter); // ja está com basebath implicitamente
secureRoutes.use("/products", productRouter); // ja está com basebath implicitamente
secureRoutes.use("/carts", cartRouter); // ja está com basebath implicitamente
secureRoutes.use("/orders", orderRouter); // ja está com basebath implicitamente
unsecurityRoutes.use("/teste", testeRouter); 
unsecurityRoutes.use("/stripe", stripeRouter); // ja está com basebath implicitamente

//midlewares de rotas nao seguras
app.use(basePath + "/auth", authRouter);




// Aplique o basePath às rotas seguras

app.use(basePath, secureRoutes);
app.use(basePath, unsecurityRoutes);





app.listen(5000,()=>{
    console.log("Backend server is running!!")
})


