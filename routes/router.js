const express = require('express')
const router = express.Router()

const controller = require('../controller/auth_controller')
//Root GET route setting
router.get('/', (req, res) =>{
    res.render('index')
});
//Login route setting
router.get('/login', (req,res) =>{
    res.render('login')
})
//Register route setting
router.get('/registro', (req,res) =>{
    res.render('register')
})

router.post('/register', controller.register)
module.exports = router