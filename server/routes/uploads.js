const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const Usuario = require('../models/user');
const Producto = require('../models/product');
const fs = require('fs');
const path = require('path');
app.use(fileUpload());

app.put('/upload/:tipo/:id', (req, res) => {
    let tipo = req.params.tipo;
    let id = req.params.id;
    //Validar tipo
    let tiposValidos = ['products', 'users'];
    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Los tipos permitidos son ' + tiposValidos.join(', '),
                tipo
            }
        })
    }

    if (Object.keys(req.files).length == 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'No se ha seleccionado ningún imagen'
            }
        })
    }
    let file = req.files.archivo;

    // Extensiones permitidas
    let extensions = ['png', 'jpg', 'jpeg'];
    let nameFileCut = file.name.split('.');
    let extention = nameFileCut[nameFileCut.length - 1];
    if (extensions.indexOf(extention) < 0) {
        return res.status(400).json({
            ok: false,
            err: {
                message: 'Las extensiones permitidas son ' + extensions.join(', '),
                extention
            }
        })
    }
    //Cambiar el nombre al archivo
    let uniqueID = Math.random().toString(36).substr(2, 9);
    let fileName = `${id}${uniqueID}.${extention}`;

    file.mv(`uploads/${tipo}/${fileName}`, (err) => {
        if (err)
            return res.status(500).json({
                ok: false,
                err
            });
        tipo == 'users' ? imagenUsuario(id, res, fileName) : imagenProducto(id, res, fileName);
    });
});

function imagenUsuario(id, res, fileName) {
    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            borrarArchivo(fileName, 'users')
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!usuarioDB) {
            borrarArchivo(fileName, 'users')
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario No existe'
                }
            });
        }
        borrarArchivo(usuarioDB.img, 'users')
        usuarioDB.img = fileName;
        usuarioDB.save((err, putUser) => {
            res.json({
                ok: true,
                putUser,
                img: fileName
            })
        })

    });
}

function imagenProducto(id, res, fileName) {
    Producto.findById(id, (err, productoDB) => {
        if (err) {
            borrarArchivo(fileName, 'products')
            return res.status(500).json({
                ok: false,
                err
            });
        }
        if (!productoDB) {
            borrarArchivo(fileName, 'products')
            return res.status(500).json({
                ok: false,
                err: {
                    message: 'Usuario No existe'
                }
            });
        }
        borrarArchivo(productoDB.img, 'products')
        productoDB.img = fileName;
        productoDB.save((err, putProducto) => {
            res.json({
                ok: true,
                putProducto,
                img: fileName
            })
        })

    });
}

function borrarArchivo(nombreImagen, tipo) {
    let pathUrl = path.resolve(__dirname, `../../uploads/${tipo}/${nombreImagen}`);
    if (fs.existsSync(pathUrl)) {
        fs.unlinkSync(pathUrl);
    }
}
module.exports = app;