const jwt = require("jsonwebtoken")

const protect = (req,res,next) => {
    let token = req.headers.authorization

    if(token && token.startsWith("Bearer")){
        try{
            token = token.split(" ")[1]
            const decoded = jwt.verify(token,process.env.JWT_SECRET)
            req.user = {id: decoded.id};
            next()
        }
        catch(error){
            res.status(401).json({error:"Not authorized"})
        }
    }
    else {
        res.status(401).json({error:"No token"})
    }
};

module.exports = protect