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
        let password_hash = await bcryptjs.hash(password, 8)
        connection.query('INSERT INTO users SET ?', {name:name, email:email, password:password_hash}, (error, results) =>{
            if(error){
                switch(error.code){
                    case'ER_DUP_ENTRY':
                    res.send("Email Duplicado");
                    break;
                    default:
                    res.send("Error de Base de Datos")
                }
            }else{
                res.send("Registro Exitoso")
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
                    //Token Creation using user unique ID
                    const id = results[0].id
                    const token = jwt.sign({id:id}, process.env.JWT_KEY , {
                        expiresIn : process.env.JWT_EXPIRE_TIME,
                    })

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
    }catch (error){
        console.log(error);
    }
}

//Update user data
exports.update = async(req, res) =>{
    try{
        console.log("El usuario quiere actualizar su data" + req)
    }catch(error){
        console.log(error);
    }
}

//User authentication method
exports.isAuthenticated = async(req, res, next) =>{
    if(req.cookies.jwt){
        try{
            const decoded = await promisify(jwt.verify)(req.cookie.jwt, process.env.JWT_KEY)
            conexion.query('SELECT * FROM users WHERE id = ?', [decoded.id], (error,results) =>{
                if(!results){return next()}
                req.user = results[0];
                return next()
            })
        }catch(error){
            console.log(error)
        }
    }else{
        console.log("Cookie required")
        res.redirect("/index")
        res.send("User not authenticated")
    }
}

exports.logout = (req, res) =>{
    res.clearCookie('jwt')
    return res.send('userLogout');
}