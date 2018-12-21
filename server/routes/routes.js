const Usuario = require('../models/user');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const _ = require('underscore');
const { checkToken,checkRoleUser } = require('../middlewares/auth');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/usuario', checkToken, (req, res) => {

    //req.query get parameters by default
    let desde = Number(req.query.desde || 0);
    let limite = Number(req.query.limit || 5);
    // The second parameter we can skip or add any attribute from the Schema
    Usuario.find({ estado: true }, 'nombre').skip(desde)
        .limit(limite)
        .exec((err, usuarios) => {
            if (err) return res.status(400).json({
                ok: false,
                err
            })
            Usuario.countDocuments({ estado: true }, (err, counting) => {
                res.json({
                    ok: true,
                    usuarios,
                    count: counting
                })
            }).skip(desde).limit(limite)

        });
});

app.post('/usuario', [checkToken,checkRoleUser], (req, res) => {
    //Save all body from the request
    let body = req.body;
    //Setting the attributes for a new Usuario
    let usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        //Using the bcrypt library
        password: bcrypt.hashSync(body.password, 10),
        rol: body.rol
    });
    //Function 'save' from moongose to add new User in MongoDB
    usuario.save((err, usuarioDB) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            usuario: usuarioDB
        })
    })
});

app.put('/usuario/:id', [checkToken,checkRoleUser], (req, res) => {
    //Getting the id from the URL
    let id = req.params.id;
    //Using only the fileds nombre,email,img,rol,estado in body
    let body = _.pick(req.body, ['nombre', 'email', 'img', 'rol', 'estado']);
    // using findByIdAndUpdate()
    //id to find,
    //     // {
    //         new: true // new User,
    //         runValidators: true // Activate validations from schema
    //         context:'query' // Update something avoiding if one value from an attribute exists
    // }


    Usuario.findByIdAndUpdate(id, body, { new: true, runValidators: true, context: 'query' }, (err, usuarioDB) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            usuario: usuarioDB
        });
    });

});

app.delete('/usuario/:id', [checkToken,checkRoleUser],(req, res) => {
    let id = req.params.id;
    Usuario.findOneAndUpdate(id, { estado: false }, { new: true, context: 'query' }, (err, usuarioDelete) => {
        if (err) return res.json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            usuario: usuarioDelete
        });
    });
});

module.exports = app;