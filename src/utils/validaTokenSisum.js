
const jwt = require("jsonwebtoken");

const validaTokenSisum = (req, res, next) => {

    //considerando que foi injetado um cookie com nome sisum_access_token no dominio
    const token = req.cookies["sisum_access_token"];
    
    if (token) {
        // Decodifica o token para acessar o payload
        const decoded = jwt.decode(token, { complete: true });
        if (!decoded || !decoded.payload.publicKey) {
            return res.status(403).json("Token sisum não é válido");
        }

        const publicKey = decoded.payload.publicKey; // Obter a chave pública do payload

        // Verifica o token usando a chave pública
        jwt.verify(token, publicKey, { algorithms: ['RS256'] }, (error, data) => {
            if (error) {
                console.error("Erro na verificação do token sisum: ", error);
                return res.status(403).json("Token sisum não é válido");
            }

            req.user = data; // Armazena os dados do usuário na requisição
            next();
        });
    } else {
        return res.status(401).json("Não foi possivel ler um access token sisum");
    }
};


module.exports = {validaTokenSisum}