const express = require('express');
const app = express()
const Producto = require('../models/product');
const { checkRoleUser, checkToken } = require('../middlewares/auth')
//GET all products
//populate USUARIO and CATEGORIA
//Paginado
app.get('/producto', checkToken, (req, res) => {
    let limite = Number(req.query.limite || 5);
    let desde = Number(req.query.desde || 0);
    Producto.find({ disponible: true })
        .skip(desde)
        .limit(limite)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, products) => {
            if (err) return res.status(400).json({
                ok: false,
                err
            });
            res.json({
                ok: true,
                products
            })
        });
});
//GET Producto
//USUARIO and CATEGORIA
app.get('/producto/:id', checkToken, (req, res) => {
    let id = req.params.id;
    Producto.findById(id)
        .populate('usuario', 'nombre email')
        .populate('categoria', 'descripcion')
        .exec((err, getProducto) => {
            if (err) return res.status(400).json({
                ok: false,
                err
            });
            res.json({
                ok: true,
                producto: getProducto
            })
        });
});

//SEARCH PRODUCT
app.get('/producto/buscar/:termino',checkToken,(req,res)=>{
    let regExp = new RegExp(req.params.termino,'i');
    Producto.find({nombre: regExp})
    .populate('categoria','descripcion')
    .exec((err,productos)=>{
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok:true,
            productos
        })
    });
});
//POST new product
//Who did the POST and choose a CATEGORY
app.post('/producto', checkToken, (req, res) => {
    let body = req.body;
    let producto = new Producto({
        nombre: body.nombre,
        precioUni: body.precio,
        descripcion: body.descripcion,
        categoria: body.categoria,
        usuario: req.usuario._id
    });
    producto.save((err, newProducto) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            producto: newProducto
        });
    });
});
//PUT Update product
app.put('/producto/:id', checkToken, (req, res) => {
    let body = req.body;
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, body, { new: true }, (err, putProducto) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            producto: putProducto
        });
    });
});
//DELETE change disponible to false
app.delete('/producto/:id', checkToken, (req, res) => {
    let id = req.params.id;
    Producto.findByIdAndUpdate(id, { disponible: false }, (err, deleteProducto) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({ 
            ok: true,
            producto: deleteProducto,
            message:'Producto Borrado'
        });
    })
});
module.exports = app; 