document.addEventListener('DOMContentLoaded', function () {
    var stripe = Stripe('pk_test_51PIg3ZCg1Iux5iLxYB19CqFSEmkEBhRqbipX5vUN1Uc2qhfREDMi8J1lT4d7XZr5Tp8wC8e60i0RG3GlqER11wsY00NmtgScBV');
    var elements = stripe.elements();
    var cardElement = elements.create('card');
    const input = document.getElementById('amount');




    cardElement.mount('#card-element');

    input.addEventListener('input', formatCurrency);

    function formatCurrency(event) {
        let value = event.target.value;
        
        // Remove all caracteres que não sejam dígitos ou vírgulas
        value = value.replace(/[^\d,]/g, '');

        // Substituir vírgulas por pontos para usar o padrão de ponto flutuante
        value = value.replace(',', '.');
        
        // Adiciona o formato de moeda
        const [integer, decimal] = value.split('.');
        
        // Separa os inteiros em grupos de 3 dígitos
        const integerPart = integer ? parseInt(integer, 10).toLocaleString('pt-BR') : '0';
        
        // Adiciona os centavos com duas casas decimais
        const decimalPart = decimal ? decimal.substring(0, 2) : '00';
        
        // Construa o valor formatado
        event.target.value = `R$ ${integerPart},${decimalPart}`;
    }

    var form = document.getElementById('payment-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        var submitButton = form.querySelector('button[type="submit"]');
        submitButton.disabled = true;

        var amount = document.getElementById('amount').value;

        // Extraia o valor numérico sem a formatação
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
                        valor: amountNumeric
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
        // Remove os pontos e substitui a vírgula por ponto
        let cleanedAmount = amount.replace(/\./g, '').replace(',', '.');
        
        // Converte para número flutuante
        let number = parseFloat(cleanedAmount);
        
        // Retorna o valor numérico em formato de string para ser enviado
        return number.toFixed(2); // Mantém 2 casas decimais
    }
});
