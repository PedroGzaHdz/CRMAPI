const mongoose = require('mongoose')
require('dotenv').config({path: 'variables.env'})

const conectarDB = async ()=>{
    try{
        await mongoose.connect(process.env.DB_MONGO,  {useNewUrlParser: true,
            useUnifiedTopology: true, useFindAndModify: false,useCreateIndex:true})
        console.log('Mongo conectado')
    }catch (e){
        console.log('hubo un error')
        console.log(e)
        process.exit(1) //Detiene el proyecto
    }
}

module.exports = conectarDB;