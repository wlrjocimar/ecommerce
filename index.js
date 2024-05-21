const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const jwt = require('jsonwebtoken');
const secureRoutes  = express.Router();
const cookieParser = require('cookie-parser');

const userRouter = require("./src/routes/user.js")
const authRouter = require("./src/routes/auth.js");
const productRouter = require("./src/routes/product.js");
const cartRouter = require("./src/routes/cart.js");
const orderRouter = require("./src/routes/order.js");
const stripeRouter = require("./src/routes/stripe.js");
const { revalidateToken } = require("./src/utils/verifyToken.js");

dotenv.config();

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



//midleware
secureRoutes.use(revalidateToken);
secureRoutes.use("/users", userRouter); // ja está com basebath implicitamente
secureRoutes.use("/products", productRouter); // ja está com basebath implicitamente
secureRoutes.use("/carts", cartRouter); // ja está com basebath implicitamente
secureRoutes.use("/orders", orderRouter); // ja está com basebath implicitamente
secureRoutes.use("/stripe", stripeRouter); // ja está com basebath implicitamente

//midlewares de rotas nao seguras
app.use(basePath + "/auth", authRouter);



// Aplique o basePath às rotas seguras

app.use(basePath, secureRoutes);





app.listen(5000,()=>{
    console.log("Backend server is running!!")
})


