const jwt = require("jsonwebtoken");
const {SECRET_key} = require("../controllers/users.controller");

const checkAuth = (req, res, next) => {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, SECRET_key);
            if (decoded){
                next();
            } else {
                res.redirect('/public/clients/dist/index.html')
            }
        } catch (err) {
            res.redirect('/public/clients/dist/index.html')
        }
    } else {
        res.redirect('/public/clients/dist/index.html')
    }
};

const checkAuthAPI = (req, res) => {
    if (req.cookies && req.cookies.token) {
        try {
            const decoded = jwt.verify(req.cookies.token, SECRET_key);
            res.status(200).json(decoded.data);
        } catch (err) {
            res.status(401).json({error: err.message});
        }
    } else {
        res.status(401).json({error: "Unauthorized"});
    }
};

module.exports = {
    checkAuth,
    checkAuthAPI,
};