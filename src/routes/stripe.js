const express = require("express");
const router = express.Router();

const dotenv = require("dotenv");
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_KEY);
router.post('/payment', async (req, res) => {
  const token = req.body.stripeToken;
  const valor = req.body.valor;
  
  
  try {
    const pagamento = await stripe.charges.create({
      amount: valor * 100,
      currency: 'brl',
      source: token,
      description: 'Descrição do pagamento',
    });

    // Verifica se o pagamento foi bem-sucedido
    if (pagamento.status === 'succeeded') {
      console.log(pagamento.receipt_url);
      // Sucesso
      return res.status(200).json({ receiptPayment: pagamento.receipt_url });
    } else {
      // Se o pagamento não for bem-sucedido, lança um erro
      throw new Error('O pagamento não foi bem-sucedido.');
    }
  } catch (error) {
    // Erro
    return res.status(500).json('Erro ao processar o pagamento: ' + error.message);
  }
});




module.exports = router;
