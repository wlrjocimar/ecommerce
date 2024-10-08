const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
const stripe = require('stripe')(process.env.STRIPE_KEY);

router.post('/payment', async (req, res) => {
  console.log("Dados recebidos:", req.body);

  const { amount, name, phone, email, address } = req.body;

  console.log("Token gerado no cliente:", req.body.stripeToken);

  try {
    // Criar ou recuperar um cliente
    let customer;

    const existingCustomers = await stripe.customers.list({
      email: email,
      limit: 1,
    });

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0]; // Cliente existente
    } else {
      customer = await stripe.customers.create({
        email: email,
        name: name,
        phone: phone,
        address: {
          line1:"Estrada do pocinho ,969",
          city: "quatro barras",
          state: "parana",
          postal_code: "83420000",
          country: "Brazil",
        }
      });
    }

    // Criação do PaymentMethod a partir do token
    const paymentMethod = await stripe.paymentMethods.create({
      type: 'card',
      card: {
        token: req.body.stripeToken,
      },
      billing_details: {
        email: email,
        name: name,
        phone: phone,
        address: {
          line1:"Estrada do pocinho ,969",
          city: "quatro barras",
          state: "parana",
          postal_code: "83420000",
          country: "BR",
        }
      }
    });

    // Criação e confirmação do PaymentIntent
    const pagamento = await stripe.paymentIntents.create({
      amount: amount * 100, // Valor em centavos
      currency: 'brl',
      customer: customer.id, // ID do cliente
      payment_method: paymentMethod.id, // Use o ID do PaymentMethod criado
      description: 'Descrição do pagamento',
      receipt_email: email, // Email para envio de recibo
      confirm: true, // Confirma automaticamente
      return_url: 'https://inovaestudios.com.br', // Substitua pela sua URL de retorno
    });

    // Verifica se o pagamento foi bem-sucedido
    if (pagamento.status === 'succeeded') {
      const receiptUrl = pagamento.charges.data[0].receipt_url;
      // Redireciona para a URL do recibo do Stripe
      return res.redirect(receiptUrl);
    } else {
      throw new Error('O pagamento não foi bem-sucedido.');
    }
  } catch (error) {
    console.error('Erro ao processar o pagamento:', error.message);
    return res.status(500).json({ error: 'Erro ao processar o pagamento: ' + error.message });
  }
});

module.exports = router;
