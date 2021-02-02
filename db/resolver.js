const Usuario = require('../models/Usuario')
const Producto = require('../models/Producto')
const Cliente = require('../models/Cliente')
const Pedido = require('../models/Pedidos')


const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken')
require('dotenv').config({path: 'variables.env'})
const crearToken = (usuario, secreta, expiracion) => {
    const {id, email, apellido, nombre} = usuario
    return jwt.sign({id, email, apellido, nombre}, secreta, {expiresIn: expiracion})
}
const resolvers = {
    Query: {

        changePasswrd: async (_) => {
            const password = await bcryptjs.hash('123456', 10);
            await Usuario.findOneAndUpdate({_id: "5f62ce5659e81c3044a96d84"}, {password}, {new: true});
            return 'Quedo'

        },
        obtenerUsuario: async (_,{},ctx) => {
            return ctx;
        },
        //Producto
        obtenerProductos: async () => {
            try {
                const TotalProducto = await Producto.find({});
                return TotalProducto
            } catch (e) {
                console.log(e)
            }
        },
        obtenerProductoID: async (_, {id}) => {
            try {
                //refvisar si existe o no
                const producto = await Producto.findById(id);
                if (!producto) throw new Error('Producto no encontrado')
                return producto
            } catch (e) {
                console.log(e)
            }
        },
        obtenerClientes: async () => {
            try {
                return await Cliente.find({})
            } catch (e) {
                console.log(e)
            }
        },
        obtenerClientesVendedor: async (_, {}, ctx) => {
            try {
                return await Cliente.find({vendedor: ctx.id.toString()})
            } catch (e) {
                return e;
            }
        },
        obtenerCliente: async (_, {id}, ctx) => {
            try {

                //Verificar si existe
                const cliente = await Cliente.findById(id);
                if (!cliente) throw new Error('El cliente no existe')

                //Quien lo creo puede verlo
                if (cliente.vendedor.toString() !== ctx.id) throw new Error('Sin permisos requeridos')

                return cliente
            } catch (e) {
                return e
                console.log(e)
            }
        },
        //Pedido
        obtenerPedidos: async () => {
            try {
                const pedidos = await Pedido.find({});
                return pedidos;
            } catch (e) {
                console.log(e)
            }
        },
        obtenerPedidosVendedor: async (_, {}, ctx) => {
            try {
                const pedidos = await Pedido.find({vendedor: ctx.id}).populate('cliente');
                return pedidos;
            } catch (e) {
                console.log(e)
            }
        },
        obtenerPedido: async (_, {id}, ctx) => {
            //Si existes
            const pedido = await Pedido.findById(id);
            if (!pedido) throw new Error('Pedido no encontrado')
            //Solo quien lo creo puede verlos
            if (pedido.vendedor.toString() !== ctx.id) throw new Error('No tienes las credenciales')

            //retornar el resultado
            return pedido
        },
        obtenerPedidosEstado: async (_, {estado}, ctx) => {
            const pedidos = await Pedido.find({vendedor: ctx.id, estado});
            return pedidos;
        },
        //Avanzadas
        mejoresClientes: async () => {
            const clientes = await Pedido.aggregate([
                {$match: {estado: "COMPLETADO"}},
                {
                    $group: {
                        _id: "$cliente", total: {$sum: '$total'}
                    }
                },
                {
                    $lookup: {
                        from: "clientes",
                        localField: '_id',
                        foreignField: '_id',
                        as: "cliente"
                    }
                },

                {
                    $limit: 10
                },

                {
                    $sort: {
                        total: -1
                    }
                }
            ])

            return clientes;
        },
        mejoresVendedores: async () => {
            const vendedores = await Pedido.aggregate([
                {
                    $match: {estado: "COMPLETADO"}
                },
                {
                    $group: {
                        _id: "$vendedor",
                        total: {$sum: '$total'}
                    }
                },
                {
                    $lookup: {
                        from: 'usuarios',
                        localField: "_id",
                        foreignField: "_id",
                        as: "vendedor"
                    }
                },
                {
                    $limit: 3
                },
                {
                    $sort: {total: -1}
                }
            ])
            return vendedores
        },
        buscadorProducto: async (_, {text}) => {
            const productos = await Producto.find({
                $text: {
                    $search: text
                }
            }).limit(10)
            return productos;
        }

    },

    Mutation: {
        nuevoUsuario: async (_, {input}) => {

            const {email, password} = input
            //Revisar si el usuario ya esta registrado
            const existeUsuario = await Usuario.findOne({email})
            if (existeUsuario) {
                throw new Error('El usuario ya existe')
            }
            //Hashear su password
            // console.log(salt)
            input.password = await bcryptjs.hash(password, 10);

            try {
                //Guardar en la base de datos
                const usuario = new Usuario(input)
                usuario.save()
                return usuario;
            } catch (e) {
                console.log(e)
            }
        },
        autenticarUsuario: async (_, {input}) => {
            const {email, password} = input
            //Si el usuario existe
            const existe = await Usuario.findOne({email})
            if (!existe) {
                throw new Error('El usuario no existe');
            }
            //Revisar el password es correcto
            const passwordCorrecto = await bcryptjs.compare(password, existe.password);
            if (!passwordCorrecto) {
                throw new Error('Contraseña incorrecta');
            }
            //General token
            return {
                token: crearToken(existe, process.env.SECRETA, '24h')
            }
        },
        //  Resolver Producto
        nuevoProducto: async (_, {input}) => {
            try {
                const nuevoProducto = new Producto(input)
                const resultado = await nuevoProducto.save()
                return resultado
            } catch (e) {
                console.log(e)
            }
        },
        actualizarProducto: async (_, {id, input}) => {
            try {
                let producto = await Producto.findById(id);
                if (!producto) throw new Error('Producto no encontrado')
                //Actualizar el producto
                producto = await Producto.findOneAndUpdate({_id: id}, input, {new: true});
                return producto
            } catch (e) {
                console.log(e)
            }
        },
        EliminarProducto: async (_, {id}) => {
            try {
                let producto = await Producto.findById(id);
                if (!producto) throw new Error('Producto no encontrado')
                //Eliminar el producto
                await Producto.findOneAndDelete({_id: id});
                return "Producto Eliminado"
            } catch (e) {
                throw new Error(e)
            }
        },
        //Cliente
        nuevoCliente: async (_, {input}, ctx) => {
            try {
                const {email} = input
                //Verificar si el cliente ya esta registrado
                const cliente = await Cliente.findOne({email});
                if (cliente) throw new Error('El cliente ya fue registrado')
                const nuevoCliente = new Cliente(input);
                //Asignar el vendedor
                nuevoCliente.vendedor = ctx.id

                // Guardar en la bd

                const resultado = await nuevoCliente.save()
                return resultado;
            } catch (e) {
                throw new Error(e)
            }
        },
        actualizarCliente: async (_, {id, input}, ctx) => {
            try {
                //Verificar si existe o no
                let cliente = await Cliente.findById(id);
                if (!cliente) throw new Error('El Cliento no existe')
                //Verificar si el vendedor es quien lo edita
                if (cliente.vendedor.toString() !== ctx.id) throw new Error('Sin permisos requeridos')
                //Guardar el cliente
                cliente = await Cliente.findOneAndUpdate({_id: id}, input, {new: true});
                return cliente;
            } catch (e) {
                throw new Error(e)
            }

        },
        eliminarCliente: async (_, {id}, ctx) => {
            try {
                //Verificar si existe o no
                let cliente = await Cliente.findById(id);
                if (!cliente) throw new Error('El Cliento no existe')
                //Verificar si el vendedor es quien lo edita
                if (cliente.vendedor.toString() !== ctx.id) throw new Error('Sin permisos requeridos')
                //Guardar el cliente
                await Cliente.findOneAndDelete({_id: id});
                return "Cliente Eliminado";
            } catch (e) {
                throw new Error(e)
            }
        },
        //Pedidos
        nuevoPedido: async (_, {input}, ctx) => {
            const {cliente} = input
            //Verificar si el cliente existe o no
            let clienteExiste = await Cliente.findById(cliente);
            if (!clienteExiste) throw new Error('El Cliento no existe')
            //Verificar si el cliente es del vendedor
            if (clienteExiste.vendedor.toString() !== ctx.id) throw new Error('Sin permisos requeridos')
            //Revisar que el stock este disponible
            let PromiseSaveStock = []
            for await (const articulo of input.pedido) {
                const {id} = articulo
                const producto = await Producto.findById(id)
                if (articulo.cantidad > producto.existencia) {
                    throw Error(`El articulo: ${producto.nombre} excede la cantidad disponible`)
                } else {
                    //Restar la cantidad a lo disponible
                    producto.existencia = producto.existencia - articulo.cantidad;
                    PromiseSaveStock.push(producto)
                }
            }

            for await (const promise of PromiseSaveStock) {
                promise.save()
            }
            //Crear un nuevo pedido
            const nuevoPedido = new Pedido(input)

            //asignar un vendedor
            nuevoPedido.vendedor = ctx.id
            //Guardar en la BS
            return await nuevoPedido.save();
        },
        actualizarPedido: async (_, {id, input}, ctx) => {
            const {cliente} = input;
            //Exist
            const existePedido = await Pedido.findById(id);
            if (!existePedido) throw new Error('El pedido no existe')
            //CLiente existe
            const existeCliente = await Cliente.findById(cliente);
            if (!existeCliente) throw new Error('El Cliente no existe')
            //Si el cliente y pedido pertenece al vendedor
            if (existeCliente.vendedor.toString() !== ctx.id) throw new Error('Sin permisos requeridos')
            //revisar el stock
            if (input.pedido) {
                let PromiseSaveStock = []
                for await (const articulo of input.pedido) {
                    const {id} = articulo
                    const producto = await Producto.findById(id)
                    if (articulo.cantidad > producto.existencia) {
                        throw Error(`El articulo: ${producto.nombre} excede la cantidad disponible`)
                    } else {
                        //Restar la cantidad a lo disponible
                        producto.existencia = producto.existencia - articulo.cantidad;
                        PromiseSaveStock.push(producto)
                    }
                }

                for await (const promise of PromiseSaveStock) {
                    promise.save()
                }
            }
            //Guardar pedido
            const resultado = await Pedido.findOneAndUpdate({_id: id}, input, {new: true});
            return resultado;
        },
        eliminarPedido: async (_, {id}, ctx) => {
            try {
                let pedido = await Pedido.findById(id);
                if (!pedido) throw new Error('Pedido no encontrado')
                //Validar el vendedor
                if (pedido.vendedor.toString() !== ctx.id) throw new Error('Sin permisos requeridos')
                //Eliminar
                await Pedido.findOneAndDelete({_id: id});
                return "Pedido Eliminado"
            } catch (e) {
                throw new Error(e)
            }
        }

    }

}


module.exports = resolvers



