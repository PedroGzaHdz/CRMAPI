const {gql} = require('apollo-server');

const typeDefs = gql`
    type Usuario {
        id: ID,
        nombre: String
        apellido: String
        email: String
        creado: String,
        
    } 
    type Token{
        token: String
    }
    
  
    input UsuarioInput {
        nombre: String!
        apellido: String!
        password: String!
        email: String!
    }
    input AutenticarInput{
        email: String!
        password: String!
    }
    
    #ProductoModel
    type Producto{
        id: ID
        nombre: String
        existencia: Int
        precio: String
        creado: String
    }
    
    input ProductoInpur{
        nombre: String!
        existencia: Int!
        precio: String!
    }
    #ClienteModel
    type Cliente{
        id: ID
        nombre: String
        apellido: String
        empresa: String
        email: String
        telefono: String
        vendedor: ID
        creado: String
    }
    input ClienteInput {
         nombre: String!
         apellido: String!
         empresa: String!
         email: String!
         telefono: String
    }
    #PedidoModel
    type Pedido{
        id: ID
        pedido: [PedidooGrupo]
        total: Float
        cliente: Cliente
        vendedor: ID
        creado: String
        estado: EstadoPedido
     }
    type PedidooGrupo{
        id: ID
        cantidad: Int
        nombre: String
        precio: String  
    }
    input PedidoProductoInput{
        id: ID
        cantidad: Int
        nombre: String
        precio: String 
    }
    input PedidoInput{
        pedido: [PedidoProductoInput]
        total: Float
        cliente: ID
        estado: EstadoPedido
    }
    enum EstadoPedido{
        PENDIENTE
        COMPLETADO
        CANCELADO
    }
    #Avanzada
    type TopCliente{
        total: Float,
        cliente: [Cliente]
    }
    type TopVendedor{
        total: Float,
        vendedor: [Usuario]
    }
    type Query {
       obtenerUsuario: Usuario
       #Productos
       obtenerProductos: [Producto]
       obtenerProductoID(id: ID!): Producto
       #Clientes
       obtenerClientes: [Cliente]
       obtenerClientesVendedor: [Cliente]
       obtenerCliente(id:ID!): Cliente
       #Pedidos 
        obtenerPedidos: [Pedido]
        obtenerPedidosVendedor:[Pedido],
        obtenerPedido(id: ID!): Pedido
        obtenerPedidosEstado(estado: String!): [Pedido]
        #Busqueda avanzada
        mejoresClientes: [TopCliente]
        mejoresVendedores: [TopVendedor]
        buscadorProducto(text: String!): [Producto]
        changePasswrd: String
    }
    type Mutation {
        
        #Usuarios
        nuevoUsuario(input: UsuarioInput) : Usuario,
        autenticarUsuario(input: AutenticarInput ): Token
        
        #Productos
        nuevoProducto(input: ProductoInpur) :  Producto       
        actualizarProducto(id: ID! , input: ProductoInpur!) :  Producto       
        EliminarProducto(id: ID!) :  String   
        
        #Cliente  
        nuevoCliente(input: ClienteInput) : Cliente  
        actualizarCliente(id: ID!, input: ClienteInput): Cliente
        eliminarCliente(id:ID!): String
        #Pedidos     
        nuevoPedido(input: PedidoInput): Pedido  
        actualizarPedido(id: ID!, input: PedidoInput): Pedido
        eliminarPedido(id: ID!) : String
        
    }
`

module.exports = typeDefs
