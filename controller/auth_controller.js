const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const connection = require('../database/db')
const {promisify} = require('util')

//Register method
exports.register = async(req, res) => {
    
    try{
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        let password_hash = await bcrypt.hash(password, 8)
        connection.query('INSERT INTO users SET ?', {name:name, email:email, password:password_hash}, (error, results) =>{
            if(error){
                console.log(error)
            }
        })
    }catch(error){
        console.log(error)
    }
}