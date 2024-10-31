const express = require('express');
const router = express.Router();
const productController = require("../controller/productcontroller");
const UserController = require("../controller/authcontroler");
const multer  = require('multer')
const upload = multer({storage: multer.diskStorage({})});
const cloudinary = require('cloudinary').v2
const authcontroler = require("../controller/authcontroler");
const rolecontrooler= require("../controller/middelware");
// Define routes and associate them with controller methods
router.get('/404',authcontroler.checkAuthAndFetchUser, productController.errorcontroller);
router.get('/add', authcontroler.checkAuthAndFetchUser,productController.addcontroller);
router.get('/', productController.covercontroller);
router.get('/dash',authcontroler.checkAuthAndFetchUser,rolecontrooler.allrole,productController.dashcontroller);
router.get('/edit/:id',authcontroler.checkAuthAndFetchUser,rolecontrooler.allrole, productController.editcontroller);
router.get('/home',authcontroler.checkAuthAndFetchUser, productController.homecontroller);
router.get('/view/:id',authcontroler.checkAuthAndFetchUser, productController.viewcontroller);
router.post('/adduser',authcontroler.checkAuthAndFetchUser, productController.addcontroller_post);
router.post('/edituser',authcontroler.checkAuthAndFetchUser, productController.editcontroller_post);
router.post('/deleteuser/:id',authcontroler.checkAuthAndFetchUser, productController.deletecontroller_post);
router.post('/search',authcontroler.checkAuthAndFetchUser,productController.searchcontroller);

module.exports = router;

