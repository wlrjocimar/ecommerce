const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    console.log("Headers :", req.headers);

    const token = req.cookies["jwtToken"];

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
            if (error) return res.status(403).json("Token is not valid");
            req.user = data;

            next();
        });
    } else {
        return res.status(401).json("You are not authenticated!!");
    }
};

const verifyTokenAndAuthorization = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.userId === req.params.id || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to do that!!");
        }
    });
};

const revalidateToken = (req, res, next) => {
    const token = req.cookies["jwtToken"];

    if (!token) return res.status(401).json("You are not authenticated!");

    jwt.verify(token, process.env.JWT_SECRET, (error, data) => {
        if (error) return res.status(403).json("Token is not valid");

        const now = Math.floor(Date.now() / 1000);
        const timeLeft = data.exp - now;

        // Se o token estiver prestes a expirar em menos de 15 minutos
        if (timeLeft < 15 * 60) {
            const newToken = jwt.sign({ userId: data.userId, isAdmin: data.isAdmin }, process.env.JWT_SECRET, {
                expiresIn: '2h' // Novo token válido por 2 horas
            });
            res.cookie('jwtToken', newToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 2 * 60 * 60 * 1000 // 2 horas em milissegundos
            });
        }

        req.user = data;
        next();
    });
};


const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
      if (req.user.isAdmin) {
        next();
      } else {
        res.status(403).json("You are not alowed to do that!");
      }
    });
  };

module.exports = { verifyToken, verifyTokenAndAuthorization, revalidateToken,verifyTokenAndAdmin };
