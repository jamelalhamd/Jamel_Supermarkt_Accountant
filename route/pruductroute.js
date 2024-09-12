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
router.get('/dash',productController.dashcontroller);
router.get('/edit/:id', productController.editcontroller);
router.get('/home', productController.homecontroller);
router.get('/view/:id', productController.viewcontroller);
router.post('/adduser', productController.addcontroller_post);
router.post('/edituser', productController.editcontroller_post);
router.post('/deleteuser/:id', productController.deletecontroller_post);
router.post('/search',productController.searchcontroller)

module.exports = router;
