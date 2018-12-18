const Usuario = require('../models/user')
const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
//Google OAuth
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(process.env.CLIENT_ID);

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
        }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });
        res.json({
            ok: true,
            usuario: usuarioFound,
            token
        });
    })
});

//Google Config
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }

}
app.post('/google', async (req, res) => {
    let token = req.body.token;
    let googleUser = await verify(token).catch(err => {
        return res.status(403).json({
            err
        });
    });
    Usuario.findOne({ email: googleUser.email }, (err, usuarioDB) => {
        if (err) return res.status(500).json({
            ok: true,
            err
        });
        if (usuarioDB) {
            if (usuarioDB.google === false) {
                return res.status(400).json({
                    ok: true,
                    err: {
                        message: 'Must be used the normal authentication'
                    }
                });
            } else {
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            }
        } else {
            //The user doesn't exist
            let usuario = new Usuario(googleUser);
            usuario.password = ':)';
            usuario.save((err, usuarioSave) => {
                if (err) return res.status(400).json({
                    ok: true,
                    err: {
                        message: 'Must be used the normal authentication'
                    }
                });
                let token = jwt.sign({
                    usuario: usuarioDB
                }, process.env.SEED_TOKEN, { expiresIn: process.env.CADUCIDAD_TOKEN });
                return res.json({
                    ok: true,
                    usuario: usuarioDB,
                    token
                })
            })

        }
    });
});
module.exports = app;