document.addEventListener('DOMContentLoaded', function () {
    var stripe = Stripe('pk_test_51PIg3ZCg1Iux5iLxYB19CqFSEmkEBhRqbipX5vUN1Uc2qhfREDMi8J1lT4d7XZr5Tp8wC8e60i0RG3GlqER11wsY00NmtgScBV');
    var elements = stripe.elements();
    var cardElement = elements.create('card');
    const input = document.getElementById('amount');
    
    input.addEventListener('input', formatCurrency);




    cardElement.mount('#card-element');

   
    function formatCurrency(event) {
        let value = event.target.value;
        console.log(value)
    
       // Remove todos os caracteres que não sejam dígitos
       value = value.replace(/\D/g, '');

       



        // Adiciona uma vírgula na penúltima posição
        if (value.length >= 3) {
            value = value.slice(0, -2) + ',' + value.slice(-2); 
        }
        
    
        // Substitui a última vírgula por um ponto para tratar a parte decimal
        const [integer, decimal] = value.split(',');
    
        // Se a parte decimal não existir, define-a como uma string vazia
        const integerPart = integer || '';
        const decimalPart = decimal !== undefined ? decimal.substring(0, 2) : '';
    
        // Adiciona pontos como separadores de milhar
        const formattedIntegerPart = integerPart
            .split('')
            .reverse()
            .reduce((acc, char, index) => {
                return (index % 3 === 0 && index !== 0 ? `${char}.` : char) + acc;
            }, '');
    
        // Remove o ponto extra na frente
        const finalIntegerPart = formattedIntegerPart.replace(/^\./, '');
    
        // Formata o valor final
        event.target.value = `R$ ${finalIntegerPart}${decimalPart ? ',' + decimalPart : ''}`;
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
        
        // Remove todos os caracteres que não sejam dígitos
        amount = amount.replace(/\D/g, '');
        // Remove os pontos e substitui a vírgula por ponto

        if(amount.length >= 3){
            amount = amount.slice(0, -2) + '.' + amount.slice(-2); 
        } 
      
    
        
        
        // Converte para número flutuante
        let number = parseFloat(amount);
        
        // Retorna o valor numérico em formato de string para ser enviado
        return number.toFixed(2); // Mantém 2 casas decimais
    }
});
