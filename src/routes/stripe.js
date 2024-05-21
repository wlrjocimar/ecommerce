const express = require("express");
const router = express.Router();
const stripe = require('stripe')('sk_test_51PIg3ZCg1Iux5iLxH4F1mpAZP2uWsm8MrGk2jqUEvIbfqUFiFQ0OW3XwzFzwuYji4Mz9wD3qA8RybYq34Ppvc0hJ00MKJXtWvG');

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
