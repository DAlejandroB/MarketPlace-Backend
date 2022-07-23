/*
Server source for app "Farmarket"
Author: Diego Ballesteros
TBD - To be Removed
*/

const port = 3000;

//Modules inicialization
const express = require('express')
const dotenv = require('dotenv')
const cookieParser = require('cookie-parser')

//App creation
const app = express()

//Template engine setting (TBR)
app.set('view engine', 'ejs');

//Public folder for static files setting (TBR)
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:true}))

//Enviroment Variable Setting
dotenv.config({path:'./env/.env'});

//Cookie setting
app.use(cookieParser());

//Calling router
app.use('/', require('./routes/router'))
//Server connection initializing
app.listen(port , () => {
    console.log(`App listening at http://localhost:${port}`);
});