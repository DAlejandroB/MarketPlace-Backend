const mysql = require('mysql2')
const dbConfig = require('./db.config.js')
const connection = mysql.createConnection({
    host : dbConfig.HOST,
    user : dbConfig.USER,
    password : dbConfig.PASSWORD,
    database : dbConfig.DB
})

connection.connect((error) =>{
    if(error){
        console.log('Error de conexión a la DB: ' + error)
        return
    }else{
        console.log('Conectado correctamente a la base de datos')
    }
})

module.exports = connection;