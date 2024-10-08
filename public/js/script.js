document.addEventListener('DOMContentLoaded', function () {
    var stripe = Stripe('pk_live_51PIg3ZCg1Iux5iLxyB95A9BI4ARq2W66rRcvmWjXfehPM0HgIoGbtx9oh7OIrbdVonOZFur1kisNVoW2sa928vO600sxx9DlNL');
    var elements = stripe.elements();
    var cardElement = elements.create('card');
    const input = document.getElementById('amount');
    input.value = '';

    input.addEventListener('input', formatCurrency);

    cardElement.mount('#card-element');

    function formatCurrency(event) {
        let value = event.target.value;
        value = value.replace(/\D/g, '');

        if (value.length >= 3) {
            value = value.slice(0, -2) + ',' + value.slice(-2);
        }

        const [integer, decimal] = value.split(',');
        const integerPart = integer || '';
        const decimalPart = decimal !== undefined ? decimal.substring(0, 2) : '';

        const formattedIntegerPart = integerPart
            .split('')
            .reverse()
            .reduce((acc, char, index) => {
                return (index % 3 === 0 && index !== 0 ? `${char}.` : char) + acc;
            }, '');

        const finalIntegerPart = formattedIntegerPart.replace(/^\./, '');

        event.target.value = `R$ ${finalIntegerPart}${decimalPart ? ',' + decimalPart : ''}`;
    }

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        var amount = document.getElementById('amount').value;
        var name = document.getElementById('name').value; // Novo campo
        var phone = document.getElementById('phone').value; // Novo campo
        var email = document.getElementById('email').value; // Novo campo
        var address = document.getElementById('address').value; // Novo campo

        var amountNumeric = formatAmountForSubmission(amount);

        stripe.createToken(cardElement).then(function (result) {
            if (result.error) {
                document.getElementById('card-errors').textContent = result.error.message;
                submitButton.disabled = false;
            } else {
                fetch('/ec-api/stripe/payment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        stripeToken: result.token.id,
                        amount: amountNumeric,
                        name: name, // Enviando o nome
                        phone: phone, // Enviando o telefone
                        email: email, // Enviando o e-mail
                        address: address // Enviando o endereço
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.receiptPayment) {
                        window.location.href = data.receiptPayment;
                    } else {
                        alert('Ocorreu um erro ao processar o pagamento.' + JSON.stringify(data));
                    }
                })
                .catch(error => {
                    console.error('Erro:', error);
                    alert('Ocorreu um erro ao processar o pagamento.' + error);
                    submitButton.disabled = false;
                });
            }
        });
    });

    function formatAmountForSubmission(amount) {
        amount = amount.replace(/\D/g, '');
        if (amount.length >= 3) {
            amount = amount.slice(0, -2) + '.' + amount.slice(-2); 
        }
        let number = parseFloat(amount);
        return number.toFixed(2);
    }
});
