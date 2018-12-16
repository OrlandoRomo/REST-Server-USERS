//Config file
require('./config/config');

//All routes
const app = require('./routes/index');

//Mongoose library
const mongoose = require('mongoose');



mongoose.connect(process.env.URL_DB,{useNewUrlParser:true},(err,res)=>{
    if(err) throw err
    else console.log('Base de Datos lista');
});


app.listen(process.env.PORT,()=>{
    console.log(`Listeting at ${process.env.PORT}`);
})