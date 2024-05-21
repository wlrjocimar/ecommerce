const express = require("express");
const router = express.Router();
const stripe = require('stripe')('sk_test_51PIg3ZCg1Iux5iLxH4F1mpAZP2uWsm8MrGk2jqUEvIbfqUFiFQ0OW3XwzFzwuYji4Mz9wD3qA8RybYq34Ppvc0hJ00MKJXtWvG');

router.post("/payment", async (req, res) => {
    const { quantidade, token } = req.body;

    try {
      const pagamento = await stripe.charges.create({
        amount: quantidade * 100, // valor em centavos
        currency: 'brl',
        source: token,
        description: 'Descrição do pagamento',
      });
  
      res.json({ pagamento });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});

module.exports = router;
