const axios = require('axios');
const {
   
    validaTokenSisum
  } = require("../utils/validaTokenSisum");
  
  
  const router = require("express").Router();
  
  //Exemplo de uma Rota ptotegida com SisumAuth
  
 

  router.post("/gerar-token-sisum", async (req, res) => {
    const options = {
      method: 'POST',
      url: 'https://pxl0hosp0afq.dispositivos.bb.com.br/sisum-api/v1/auth/authorize',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'insomnia/10.0.0'
      },
      data: { matricula: 'F5078775' },
      httpsAgent: new require('https').Agent({  
        rejectUnauthorized: false
      }), 
      withCredentials: true
    };
  
    try {
       const response = await axios.request(options);
      
      // Repasse os dados da resposta para quem chamou
      //res.status(response.status).json(response.data);

      console.log("Recebeu cookie na requisição? ", response.headers['set-cookie'])
  
      // Adiciona os cookies, se houver
      if (response.headers['set-cookie']) {
        response.headers['set-cookie'].forEach(cookie => {
          res.append('Set-Cookie', cookie); // Use append para adicionar cookies
        });
      }
      res.status(response.status).json(response.data);
    } catch (error) {
      console.error(error);
  
      // Verifique se a resposta já foi enviada
      if (!res.headersSent) {
        res.status(500).json({ "Error": "Failed to login" });
      }
    }
  });
  


  //exemplo de requisicao para injetar um cookie com o usuario sisum

  router.post("/verificar-token", validaTokenSisum, async (req, res) => {
   
    console.log("requisiçoes  depois da leitura do access token",req)
     res.status(200).json({"Teste":"Token verificado"});
   
 });
  
  module.exports = router;