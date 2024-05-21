const express = require("express");
const router = express.Router();
const stripe = require('stripe')('sk_test_51PIg3ZCg1Iux5iLxH4F1mpAZP2uWsm8MrGk2jqUEvIbfqUFiFQ0OW3XwzFzwuYji4Mz9wD3qA8RybYq34Ppvc0hJ00MKJXtWvG');

router.post('/payment', async (req, res) => {
  const token = req.body.stripeToken;
  const valor = req.body.valor;
  
  try {
    const pagamento = await stripe.charges.create({
      amount: valor * 100,
      currency: 'brl', // Altere para a moeda desejada
      source: token,
      description: 'Descrição do pagamento',
    });

    console.log(pagamento.receipt_url);
    
    // Sucesso
    res.status(200).json({receiptPayment:pagamento.receipt_url} );
  } catch (error) {
    // Erro
    res.status(500).json('Erro ao processar o pagamento: ' + error.message);
  }
});



module.exports = router;
