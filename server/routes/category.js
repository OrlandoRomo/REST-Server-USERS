const express = require('express');
let { checkToken, checkRoleUser } = require('../middlewares/auth');
const app = express();
let Categoria = require('../models/category');
//GET Category
app.get('/category', checkToken, (req, res) => {
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email rol')
        .exec((err, category) => {
            if (err) return res.status(400).json({
                ok: false,
                err
            });
            res.json({
                ok: true,
                categories: category
            });
        });
});
//GET Category by ID
app.get('/category/:id', checkToken, (req, res) => {
    let id = req.params.id
    Categoria.findById(id, (err, category) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            category
        });
    })
});
//POST New Category
app.post('/category', checkToken, (req, res) => {
    let body = req.body;
    let categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: req.usuario._id
    })

    categoria.save((err, newCategory) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            categoria: newCategory
        });
    });
});
//PUT Category
app.put('/category/:id', checkToken, (req, res) => {
    let body = req.body.descripcion;
    let id = req.params.id;
    console.log(id, body);

    Categoria.findByIdAndUpdate(id, { descripcion: body }, { new: true, }, (err, updateCategory) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            category: updateCategory
        });
    });
});
//DELETE Only ADMIN_ROLE
app.delete('/category/:id', [checkToken, checkRoleUser], (req, res) => {
    Categoria.findByIdAndRemove(req.params.id, (err, deleteCategory) => {
        if (err) return res.status(400).json({
            ok: false,
            err
        });
        res.json({
            ok: true,
            category: deleteCategory,
            message: 'Categoria Borrado'
        })
    });
});



module.exports = app;