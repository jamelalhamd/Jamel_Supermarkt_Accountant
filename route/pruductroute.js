const express = require('express');
const router = express.Router();
const productController = require("../controller/productcontroller");
const UserController = require("../controller/authcontroler");
const { db, getStoreData,getEmployees ,runQuery} = require('../controller/db');

require('dotenv').config();
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


const multer = require('multer');
const cloudinary = require('cloudinary').v2;


const fs = require('fs'); // Required for file deletion if needed

// Configure multer storage
const upload = multer({ 
    storage: multer.diskStorage({})
});

// Configure Cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET_KEY
});

// Route to update an image for an employee
router.post("/changeimage/:id", upload.single('profileimage'), async (req, res) => {
    const file = req.file;//come from the form 
    const id = req.params.id;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path);
        const image = uploadResult.secure_url;

        // Update database with image URL
        const sql = "UPDATE employees SET image = ? WHERE employee_id = ?";
        console.log("id: " + id);
        console.log("image: " + image);
       const done=await runQuery(sql, [image, id]);
       fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting local file:', err);
    });
       if(done.affectedRows>0){
        return res.redirect(`/view/${id}`);
       }else{
        return res.redirect("/404");
       }

 

    } catch (error) {
        console.error('Error uploading to Cloudinary or updating database:', error);
        return res.redirect("/404");
    }
});

// Route to add a new image for an employee
router.post("/addimage/:id", upload.single('profileimage'), async (req, res) => {
    const file = req.file;
    const id = req.params.id;

    if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    try {
        // Upload image to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(file.path);
        
        // Optionally delete file after upload
        fs.unlinkSync(file.path);
        
        // Redirect or handle the uploaded image URL as needed
        return res.redirect(`/view/${id}`);
        
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        return res.redirect("/404");
    }
});

module.exports = router;



