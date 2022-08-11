const jwt = require('jsonwebtoken')             //JSON web Token Library used for token management 
const bcryptjs = require('bcryptjs')            //Library used for password encryption 
const connection = require('../database/db')
const {response} = require("express");    //For database operations
const tokenConfig = require('./token.config')

//Register POST method
exports.register = async(req, res) => {
    try{
        const name = req.body.name
        const email = req.body.email
        const password = req.body.password
        let password_hash = await bcryptjs.hash(password, 8)
        connection.query('INSERT INTO users SET ?', {name:name, email:email, password:password_hash, user_type:"U"}, (error, results) =>{
            if(error){
                console.log(error);
                switch(error.code){
                    case'ER_DUP_ENTRY':
                    res.send({message: "Email Duplicado"})
                    break;
                    default:
                        res.send({message: "Error de Base de Datos"})
                }
            }else{
                res.send({message: "Registro Exitoso"})
            }
        })
    }catch(error){
        console.log(error)
    }
}

/*Login POST Method
The token only includes user_id field for query porpuses
*/
exports.login = async(req, res) => {
    try{
        const userEmail = req.body.email;
        const password = req.body.password;

        connection.query('SELECT * FROM users WHERE email = ?', [userEmail], async (error, results) =>{
                if(results.length == 0 || ! (await bcryptjs.compare(password, results[0].password))){
                    res.send({
                            message:"Usuario o contraseña incorrecta"
                        })
                }
                else{
                    //Token Creation using user unique ID
                    const user_id = results[0].user_id
                    const user_type = results[0].user_type;
                    const token = jwt.sign({user_id}, tokenConfig.JWT_KEY , {
                        expiresIn : tokenConfig.JWT_EXPIRE_TIME,
                    })
                    const response = {
                        message: 'Succesful Login',
                        user_id: user_id,
                        user_type: user_type,
                        token: token
                    }
                    res.send(response)
                }
        })
    }catch (error){
        console.log(error);
    }
}

/*Update user data*/
exports.updateUser = async(req, res) =>{
    try{
        connection.query('UPDATE users SET name=? WHERE email = ? ', [req.body.valueNew, req.body.email], (error, result) => {
            if (error) throw console.log(error);
        })
        res.send({
            message: "Usuario modificado"}
            )
    }catch(error){
        if(error.code =='ERR_HTTP_HEADERS_SENT')
            console.log("A non valid response has already been sent to the user")
        else
            console.log(error);
    }
}
exports.updatePassword = async(req, res) =>{
    try{
        const userEmail = req.body.email;
        const oldPass = req.body.passOld;
        const newPass = req.body.passNew;

        connection.query('SELECT * FROM users WHERE email = ?', [userEmail], async (error, results) =>{
                if(results.length == 0 || ! (await bcryptjs.compare(oldPass, results[0].password))){
                    res.send({
                        message:"User or password not correct"
                    })
                }
                else{
                    const hashedPass = await bcryptjs.hash(newPass, 8);
                    connection.query('UPDATE users SET password=? WHERE email=?', [hashedPass, userEmail], async(error, result) =>{
                        if (error) throw console.log(error);
                        console.log(result.affectedRows + " record(s) updated");
                        res.send({
                            message:"Password modificada correctamente"
                        })
                    });
                }
        })
    }catch (error){
        console.log(error);
    }    
}

/* Delete user using id included in the token */
exports.delete = async(req,res) =>{
    try{
        connection.query('DELETE FROM interests WHERE user_id = ? ',[req.body.user.user_id]);
        connection.query('DELETE FROM publications WHERE user_id = ? ',[req.body.user.user_id]);
        connection.query('DELETE FROM users WHERE user_id = ?', [req.body.user.user_id], (error, result) =>{
            if(error) console.log(error);
            console.log(result.affectedRows + " records deleted");
            res.send({
                message :"User deleted succesfully"
            })
        })
    }catch (error){
        console.log(error)
    }
}

exports.deleteAdmin = async(req,res) =>{
    try{
        connection.query('DELETE FROM interests WHERE user_id = ? ',[req.body.user_id]);
        connection.query('DELETE FROM publications WHERE user_id = ? ',[req.body.user_id]);
        connection.query('DELETE FROM users WHERE user_id = ?', [req.body.user_id], (error, result) =>{
            if(error) console.log(error);
            console.log(result.affectedRows + " records deleted");
            res.send({
                message :"User deleted succesfully"
            })
        })
    }catch (error){
        console.log(error)
    }
}

//User authentication method
exports.isAuthenticated = async(req, res, next) =>{
    const token = req.body.token || req.query.token || req.headers["tokenstring"];
    if(!token){
        res.send({
            message: "A token is required for authentication"
        })
    }else{
        try{
            const decoded = jwt.verify(token, tokenConfig.JWT_KEY);
            req.body.user = decoded;
        }catch(error){
            return res.send({
                message: "Invalid Token"
            });
        }
    }
    return next();
}

exports.logout = (req, res) =>{
    res.clearCookie('jwt')
    return res.send('userLogout');
}

exports.allUsers = async(req, res) => {
    try {
        const user_id = parseInt(req.body.user.user_id);
        connection.query('SELECT name, email, user_type, user_id FROM users ', (error, result) => {
            if (error) {
                console.log(error)
                res.send({
                    accepted: false,
                    message: "Error de base de datos"
                })
            } else {
                res.send(result)
            }
        })
    } catch (e){
        console.log(e);
    }
}