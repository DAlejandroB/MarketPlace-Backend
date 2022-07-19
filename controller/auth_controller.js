const jwt = require('jsonwebtoken')             //JSON web Token Library used for token management 
const bcryptjs = require('bcryptjs')              //Library used for password encryption 
const connection = require('../database/db')    //For database operations
const {promisify} = require('util')

//Register POST method
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

//Login POST Methods
exports.login = async(req, res) => {
    try{
        const userEmail = req.body.email;
        const password = req.body.password;

        console.log(userEmail + "\n" + password);

        connection.query('SELECT * FROM users WHERE email = ?', [userEmail], async (error, results) =>{
                if(results.length == 0 || ! (await bcryptjs.compare(password, results[0].password))){
                    res.send("Usuario o contraseña incorrectos")
                }
                else{
                    //Placeholder for valid login
                    console.log(results)
                }
        })
    }catch{

    }
}