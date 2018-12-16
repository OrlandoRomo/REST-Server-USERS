// PORT
process.env.PORT = process.env.PORT || 3000;

// Deployment
process.env.NODE_DEV = process.env.NODE_DEV || 'dev';

//Connection URL
let urlDB;
if(process.env.NODE_DEV==='dev')
    urlDB = 'mongodb://localhost:27017/USUARIOS';
else
    urlDB = process.env.MONGO_URL;


process.env.URL_DB = urlDB;

//ExpiresIn and Seed
process.env.CADUCIDAD_TOKEN = 60*60*24*30;

process.env.SEED_TOKEN = process.env.SEED_TOKEN || 'secret'