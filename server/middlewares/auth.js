const jwt = require('jsonwebtoken');
// Check Token
let checkToken = (req, res, next) => {
    let token = req.get('token');
    jwt.verify(token, process.env.SEED_TOKEN, (err, info) => {
        if (err) return res.status(401).json({
            ok: false,
            err
        });
        //Getting user info
        req.usuario = info.usuario;
    })
    next();
};

let checkRoleUser = (req, res, next) => {
    let rol = req.usuario.rol;
    if (rol === 'ADMIN_ROLE') {
        next();
    } else {
        return res.json({
            ok: false,
            err: {
                message: 'Usuario no es administrador'
            }
        });
    }
};
module.exports = {
    checkToken,
    checkRoleUser
}