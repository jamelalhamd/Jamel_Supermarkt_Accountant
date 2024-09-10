const express = require('express');
const router = express.Router();
const productController = require("../controller/productcontroller");
const UserController = require("../controller/authcontroler");
const multer  = require('multer')
const upload = multer({storage: multer.diskStorage({})});
const cloudinary = require('cloudinary').v2

// Define routes and associate them with controller methods
router.get('/404', productController.errorcontroller);
router.get('/add', productController.addcontroller);
router.get('/', productController.covercontroller);
router.get('/dash', UserController.checkAuthAndFetchUser,productController.dashcontroller);
router.get('/edit/:id',UserController.checkAuthAndFetchUser, productController.editcontroller);
router.get('/home', productController.homecontroller);
router.get('/view/:id',UserController.checkAuthAndFetchUser, productController.viewcontroller);
router.post('/adduser',UserController.checkAuthAndFetchUser, productController.addcontroller_post);
router.post('/edituser',UserController.checkAuthAndFetchUser, productController.editcontroller_post);
router.post('/deleteuser/:id',UserController.checkAuthAndFetchUser, productController.deletecontroller_post);
router.post('/search',productController.searchcontroller)

module.exports = router;
