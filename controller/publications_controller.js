const connection = require('../database/db')
const { ImgurClient } = require('imgur');
const { Readable } = require('stream')

const client = new ImgurClient({ clientId: '713ee8613b65fb1', clientSecret: '7498566159ec695e8ec6535e25cad02e9ec68502'});
const fs = require('fs');

const uploadImage = async(imageStream, userId, pubId) =>{
    const response = await client.upload({
        image: imageStream,
        title: `pub_img-${userId}${pubId}`
    })
    return response.data.link;
}

const convertB64toStream = async(base64String) => {
    try{
        const buffer = Buffer.from(base64String, "base64");
        return Readable.from(buffer)
    }catch(error){
        console.log(error);
    }
}


//Create/Add publication methods
exports.addPublication = async(req, res) => {
    const isAviable = req.body.isAviable? 1 : 0;
    const pubImgAddress = uploadImage(convertB64toStream(req.body.imageAddress));
    try{
        connection.query('INSERT INTO publications SET ?', 
            {
                user_id:req.body.userId,
                title:req.body.title,
                aviable:isAviable,
                description:req.body.description,
                image_address: pubImgAddress,
                type:req.body.publicationType
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
    try{
            connection.query("DELETE FROM publications WHERE user_id = ? AND pub_id = ?", [req.body.user_id, req.body.idPublication], (error, result) => {
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
        connection.query("INSERT INTO interests SET ?", {user_id:req.body.userId, pub_id:req.body.idPublication}), (error) =>{
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
        connection.query("DELETE FROM interests WHERE user_id = ? AND pub_id = ?", [req.body.userId, req.body.idPublication]), (error) =>{
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
            "publications.aviable AS isAviable" +           
        "FROM interests INNER JOIN publications ON interests.pub_id = publications.pub_id " +
        "WHERE interests.user_id = ?", [req.body.userId] ,
        (error, result) =>{
            if(error){
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
        [req.body.userId], (error, result) =>{
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