const Usuario = require('../models/user')
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

app.post('/login', (req, res) => {
    let body = req.body;
    Usuario.findOne({ email: body.email }).exec((err, usuarioFound) => {
        if (err) return res.status(500).json({
            ok: false,
            err
        });
        if (!usuarioFound) return res.status(400).json({
            ok: false,
            err: {
                message: 'Object not found'
            }
        });
        if (!bcrypt.compareSync(body.password, usuarioFound.password)) return res.status(400).json({
            ok: false,
            err: {
                message: 'Object not found'
            }
        });
        let token = jwt.sign({
            usuario: usuarioFound
        }, 'secret', { expiresIn: 60 * 60 * 24 * 30 });
        res.json({
            ok: true,
            usuario: usuarioFound,
            token
        });
    })
});
module.exports = app;