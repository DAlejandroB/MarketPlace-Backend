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
router.get('/index', (req,res) =>{
    res.render('index')
})
//Register route setting
router.get('/registro', (req,res) =>{
    res.render('register')
})

router.post('/register', controller.register)

router.post('/login', controller.login)

router.post('/update', controller.isAuthenticated , controller.update)

router.post('/delete', controller.isAuthenticated, controller.delete)

router.get('/logout', controller.logout)

module.exports = router

