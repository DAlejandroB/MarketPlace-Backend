const jwt = require('jsonwebtoken')             //JSON web Token Library used for token management 
const bcryptjs = require('bcryptjs')            //Library used for password encryption 
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

        connection.query('SELECT * FROM users WHERE email = ?', [userEmail], async (error, results) =>{
                if(results.length == 0 || ! (await bcryptjs.compare(password, results[0].password))){
                    res.send("Usuario o contraseña incorrectos")
                }
                else{
                    //Placeholder
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_KEY , {
                        expiresIn : process.env.JWT_EXPIRE_TIME,
                    })
                    console.log('Usuario: ' + results[0].name)
                    console.log('TOKEN:' + token)

                    const cookieOptions = {
                        expires: new Date(Date.now()+process.env.JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000),
                        httpOnly:true
                    }
                    res.cookie('jwt', token, cookieOptions)
                    res.send({
                        message:'Login Exitoso',
                        user:results[0].name
                    })
                }
        })
    }catch{

    }
}