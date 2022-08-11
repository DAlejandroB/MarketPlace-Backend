const connection = require('../database/db')
const { ImgurClient } = require('imgur');
const { Readable } = require('stream')

const client = new ImgurClient({ clientId: '713ee8613b65fb1', clientSecret: '7498566159ec695e8ec6535e25cad02e9ec68502'});
const fs = require('fs');

const uploadImage = async(base64String, userId, pubId) =>{
    convertB64toImage(base64String);
    const response = await client.upload({
        image: fs.createReadStream('temp_image.png'),
        title: `pub_img-${userId}${pubId}`
    })
    console.log(typeof response.data.link);
    return response.data.link;
}

const convertB64toImage = async(base64String) => {
    const formattedString = base64String.replace("data:image/png;base64,","");
    try{
        const buffer = Buffer.from(formattedString, "base64");
        fs.writeFileSync('temp_image.png', buffer);
    }catch(error){
        console.log(error);
    }
}


//Create/Add publication methods
exports.addPublication = async(req, res) => {
    const isAviable = req.body.isAviable? 1 : 0;
    const pubImgAddress = await uploadImage(req.body.imageAddress);
    try{
        connection.query('INSERT INTO publications SET ?', 
            {
                user_id:req.body.user.user_id,
                title:req.body.titulo,
                aviable:isAviable,
                description:req.body.description,
                image_address: pubImgAddress,
                type:req.body.productType
            }, (error, result)=>{
            if(error){
                console.log(error)
                res.send({message: "Error de Base de Datos"})
            }else{
                res.send({
                    accepted:true,
                    message:'Publicación realizada existosamente'
                })
            }
        })
    }catch(error){

    }
}

//Get all publications method
exports.allPublications = async(req, res) =>{
    try{
        connection.query(
        "select " +
            "P.pub_id AS id_publication, " +
            "P.title AS titulo, "+
            "U.email AS emailOwner, "+
            "P.aviable AS isAviable, "+
            "P.type AS productType, "+
            "P.description, " +
            "U.name AS ownerName, "+
            "P.image_address AS imageAddress " +
        "from publications AS P inner Join users AS U on P.user_id = U.user_id;", 
        {}, (error, result) =>{
            if(error)
                console.log(error);
            else{
                res.send(result);
            }
        });
    }catch(error){
        console.log(error);
    }
}

//Delete publications 
exports.deletePublication = async(req, res) => {
    console.log(req.body);
    try{    
            const user_id = req.body.user.user_id;
            const idPublication = parseInt(req.body.idProduct);
            connection.query("DELETE FROM publications WHERE user_id = ? AND pub_id = ?", [user_id, idPublication], (error, result) => {
            if(error){
                res.send({accepted:false, message:"Ha habido un problema en la base de datos"});
                console.log(error);
            }else{
                res.send({accepted:true, message:"Se ha eliminado la publicación exitosamente"});
            }
        })
    }catch(error){
        console.log(error);
    }
}

//AddInterest Method

exports.addInterest = async(req, res) =>{
    try{
        const userId = parseInt(req.body.emailOwner);
        const pubId = parseInt(req.body.idProduct);
        connection.query("INSERT INTO interests SET ?", {user_id: userId, pub_id:pubId}), (error) =>{
            if(error){
                res.send({accepted:false, message:"Error de Base de Datos"})
                console.log(error);
            }else{
                res.send({accepted:true, message:"Interes Agregado Correctamente"})
            }
        }
    }catch(error){
        console.log(error);
    }
}

//DeleteInterest Method

exports.deleteInterest = async(req, res) =>{
    try{
        const userId = req.body.user.user_id;
        const idPublication = parseInt(req.body.idProduct);
        connection.query("DELETE FROM interests WHERE user_id = ? AND pub_id = ?", [userId, idPublication]), (error) =>{
            if(error){
                res.send({accepted:false, message:"Error de Base de Datos"})
                console.log(error);
            }else{
                res.send({accepted:true, message:"Interes Eliminado Correctamente"})
            }
        }
    }catch(error){
        console.log(error);
    }
}

//Get All user interests

exports.userInterests = async(req, res) =>{
    try {
        connection.query(
        "SELECT " +
            "interests.pub_id AS idPublication, " +
            "publications.title AS titulo, " +
            "publications.type AS productType, " +
            "publications.image_address AS imageAddress, " +
            "publications.aviable AS isAviable " +           
        "FROM interests INNER JOIN publications ON interests.pub_id = publications.pub_id " +
        "WHERE interests.user_id = ?", [req.body.user.user_id] ,
        (error, result) =>{
            if(error){
                console.log(error);
                res.send({accepted:false, message:"Error de base de datos"})
            }else{
                result.forEach(element => {
                    element.aviable = element.aviable == 0? true : false;
                });
                res.send(result);
            }
        })
    } catch (error) {
        console.log(error);
    }
}

exports.getMyPublicationInterests = async(req, res) =>{
    const pubId = req.body.id_publication;
    try{
        connection.query('select email, name from users inner join interests on users.user_id = interests.user_id where pub_id = ? ',
        [pubId], (error,result) =>{
            if(error){
                console.log(error)
                res.send({
                    accepted:false,
                    message:'Error de base de datos'
                })
            }else{
                res.send(result);
            }
        });
    }catch(error){
        console.log(error)
        res.send({
            accepted:false,
            message:'Error de base de datos'
        })
    }
}

exports.userPublications = async(req, res) => {
    try{
        connection.query(
        "select " +
            "P.pub_id AS id_publication, " +
            "P.title AS titulo, "+
            "U.email AS emailOwner, "+
            "P.aviable AS isAviable, "+
            "P.type AS productType, "+
            "P.description, " +
            "U.name AS ownerName, "+
            "P.image_address AS imageAddress " +
        "from publications AS P inner Join users AS U on P.user_id = U.user_id "+
        "WHERE U.user_id = ?", 
        [req.body.user.user_id], (error, result) =>{
            if(error)
                console.log(error);
            else{
                res.send(result);
            }
        });
    }catch(error){
        console.log(error);
    }
}