const express = require('express')
const router = express.Router()

const userController = require('../controller/user_controller')
const publications_controller = require('../controller/publications_controller');

//List of hhtp methods related to the user
router.post('/register', userController.register)

router.post('/login', userController.login)

router.post('/updateuser', userController.isAuthenticated , userController.updateUser)

router.put('/updatepass', userController.isAuthenticated, userController.updatePassword)

router.post('/delete', userController.isAuthenticated, userController.delete)

router.get('/logout', userController.logout)

//List of http methods related to interests & publications

router.post('/add-publication', userController.isAuthenticated ,publications_controller.addPublication);

router.get('/all-publications', publications_controller.allPublications);

router.post('/delete-publication', userController.isAuthenticated, publications_controller.deletePublication);

router.post('/add-interest', userController.isAuthenticated, publications_controller.addInterest);

router.post('/delete-interest', userController.isAuthenticated, publications_controller.deleteInterest);

router.get('/user-interests', userController.isAuthenticated, publications_controller.userInterests);

router.get('/user-publication', userController.isAuthenticated, publications_controller.userPublications);

router.get('/all-users', userController.isAuthenticated, userController.allUsers);

router.post('/publication-interests', userController.isAuthenticated, publications_controller.getMyPublicationInterests);

router.post('/delete_user_admin', userController.isAuthenticated, userController.deleteAdmin);

router.post('/delete-publication-admin', userController.isAuthenticated, publications_controller.deletePublicationAdmin);

module.exports = router

