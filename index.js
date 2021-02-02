const {ApolloServer} = require('apollo-server');
const typeDefs = require('./db/schema')
const resolvers = require('./db/resolver')
const conectarDB = require('./config/db')
const jwt = require('jsonwebtoken')
require('dotenv').config({path: 'variables.env'})
conectarDB();
const server = new ApolloServer(
    {
        typeDefs,
        resolvers,
        context: ({req}) => {
            const token = req.headers['authorization'] || "";
            if(token){
                try{
                    const usuario = jwt.verify(token.replace('Bearer ', ''), process.env.SECRETA);
                    return  usuario;
                }catch (e) {
                    console.log(e)
                }
            }
        }
    });
//arrancar el servidor
server.listen().then(({url}) => {
    console.log(`Server ${url}`)
})
