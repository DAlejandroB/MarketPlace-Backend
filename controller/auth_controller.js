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
                    res.send("User or password not correct")
                }
                else{
                    //Token Creation using user unique ID
                    const user_id = results[0].user_id
                    const token = jwt.sign({user_id}, process.env.JWT_KEY , {
                        expiresIn : process.env.JWT_EXPIRE_TIME,
                    })
                    const response = {
                        message: 'Succesful Login',
                        token: token
                    }
                    res.send(response)
                }
        })
    }catch (error){
        console.log(error);
    }
}

/*Update user data
The body request must contain all user data, this is done in order to facilitate DB insertion
*/
exports.update = async(req, res) =>{
    try{
        connection.query('UPDATE users SET name=?, password=? WHERE user_id = ? ', [req.body.name, req.body.password, req.body.user.user_id], (error, result) => {
            if (error) throw console.log(error);
            console.log(result.affectedRows + " record(s) updated");
        })
        res.send("Acceso a metodo update")
    }catch(error){
        if(error.code =='ERR_HTTP_HEADERS_SENT')
            console.log("A non valid response has already been sent to the user")
        else
            console.log(error);
    }
}
exports.delete = async(req,res) =>{
    try{
        console.log(req.body);
        connection.query('DELETE FROM users WHERE user_id = ?', [req.body.user.user_id], (error, result) =>{
            if(error) console.log(error);
            console.log(result.affectedRows + " records deleted");
            res.send("User deleted succesfully")
        })
    }catch (error){
        console.log(error)
    }
}
//User authentication method
exports.isAuthenticated = async(req, res, next) =>{
    const token = req.body.token || req.query.token || req.headers["x-access-token"];

    if(!token){
        res.send("A token is required for authentication")
    }else{
        try{
            const decoded = jwt.verify(token, process.env.JWT_KEY);
            req.body.user = decoded;
        }catch(error){
            return res.send("Invalid Token");
        }
    }
    return next();
}

exports.logout = (req, res) =>{
    res.clearCookie('jwt')
    return res.send('userLogout');
}