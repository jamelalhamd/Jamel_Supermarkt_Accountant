
const bodyParser = require('body-parser');
const { check, validationResult } = require("express-validator");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
//================================================
const { db, getStoreData } = require('../controller/db');
const bcrypt = require("bcrypt");
const express = require('express');
var jwt = require("jsonwebtoken");
//================================================
const logincontroler = (req, res) => {
    console.log("sign in page");
    res.render("authen/signin" ,{currentPage:"signin"});
};

const signupcontroler = (req, res) => {
   res.redirect('/add');
};


 // Update with your actual db connection

const loginpostcontroller = async(req, res) => {

  await hasesword("Afpc1967#");
    const { email, password } = req.body;
    const sql = 'SELECT * FROM employees WHERE employee_email = ?';

    console.log("Login attempt for email: " + email);

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Database error: " + err.message);
            return res.render("authen/signin", {
                currentPage: "signin",
                message: "Error fetching employee data. Please try again later."
            });
        }

        if (results.length === 0) {
            console.log("No employee found with email: " + email);
            return res.render("authen/signin", {
                currentPage: "signin",
                message: "No account found with the provided email."
            });
        }

        const employee = results[0];

        // Compare the provided password with the hashed password from the database
        bcrypt.compare(password, employee.employee_password, (err, passwordMatch) => {
            if (err) {
                console.error("Error comparing passwords: " + err.message);
                return res.render("authen/signin", {
                    currentPage: "signin",
                    message: "Error validating password. Please try again later."
                });
            }

            if (!passwordMatch) {
                console.log("Invalid password for email: " + email);
                return res.render("authen/signin", {
                    currentPage: "signin",
                    message: "Incorrect password. Please try again."
                });
            }

            // Generate a JWT token with a 1-hour expiration
            const token = jwt.sign(
                { email: employee.employee_email }, 
                process.env.JWT_SECRET_KEY, 
                { expiresIn: '8h' }
            );

            // Set the token as a secure, httpOnly cookie
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 86400000, // 24 hours
                sameSite: 'Strict',
                secure: process.env.NODE_ENV === 'production' // Set secure flag in production
            });

            console.log("Successfully logged in employee: " + email);
            res.redirect('/dash');
        });
    });
};
//Afpc1967#





const forgotPasswordController = (req, res) => {
    const { email } = req.body;
    const sql = 'SELECT * FROM employees WHERE employee_email = ?';

    db.query(sql, [email], (err, results) => {
        if (err) {
            console.error("Database error: " + err.message);
            return res.render('authen/forgot-password', { message: "Error fetching employee data." });
        }

        if (results.length === 0) {
            console.log("No employee found with email: " + email);
            return res.render('authen/forgot-password', { message: "No account found with the provided email." });
        }

        const employee = results[0];

        // Generate a reset token with JWT
        const token = jwt.sign({ email: employee.employee_email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // Send reset email with link
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
        const transporter = nodemailer.createTransport({ /* transport options */ });

        const mailOptions = {
            from: 'noreply@example.com',
            to: employee.employee_email,
            subject: 'Password Reset',
            text: `Click the following link to reset your password: ${resetLink}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error("Error sending email: " + err.message);
                return res.render('authen/forgot-password', { message: "Error sending reset email." });
            }

            console.log("Reset email sent to: " + employee.employee_email);
            res.render('authen/forgot-password', { message: "Password reset link has been sent to your email." });
        });
    });
};



const resetPasswordController = (req, res) => {
    const { token, password } = req.body;

    // Verify token
    jwt.verify(token, process.env.JWT_SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.render('authen/reset-password', { message: "Invalid or expired token." });
        }

        const sql = 'UPDATE employees SET employee_password = ? WHERE employee_email = ?';
        const hashedPassword = bcrypt.hashSync(password, 10);

        db.query(sql, [hashedPassword, decoded.email], (err, result) => {
            if (err) {
                console.error("Database error: " + err.message);
                return res.render('authen/reset-password', { message: "Error updating password." });
            }

            console.log("Password updated for email: " + decoded.email);
            res.redirect('/signin');
        });
    });
};





const post_profileIme = async (req, res) => {
    try {
       
   
       
       
        const result = await cloudinary.uploader.upload(req.file.path, { folder: "x-system/profile-imgs" });

        const decoded = jwt.verify(req.cookies.jwt, process.env.JWT_SECRET_KEY);

        await AuthUser.updateOne(
            { _id: decoded.id },
            { profileImage: result.secure_url }
        );
        res.redirect("/home");
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Error uploading image" });
    }
};

const signoutcontroler = (req, res) => {
    res.cookie("jwt", "", { maxAge: 1 });
    res.redirect("/");
};

const checkIfUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.JWT_SECRET_KEY || 'jamel2', (err, decoded) => {
            if (err) {
                res.locals.user = null;
                return next();
            }

            const email = decoded.email;
            const sql = 'SELECT * FROM employees WHERE employee_email = ?';

            db.query(sql, [email], (err, results) => {
                if (err) {
                    console.error("Error fetching employee data: " + err);
                    res.locals.user = null;
                    return next();
                }

                if (results.length === 0) {
                    console.log("No employee found with the provided email: " + email);
                    res.locals.user = null;
                } else {
                    res.locals.user = results[0];
                }

                next();
            });
        });
    } else {
        res.locals.user = null;
        next();
    }
};

const requireAuth = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token,  process.env.JWT_SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log("Token verification failed:", err.message);
                res.redirect("/");
            } else {
                console.log("Token verified successfully");
                next();
            }
        });
    } else {
        console.log("No token found");
        res.redirect("/login");
    }
};




const checkAuthAndFetchUser =async (req, res, next) => {
    const token = req.cookies.jwt;
console.log("0");
    if (token) {
        jwt.verify(token,  process.env.JWT_SECRET_KEY || 'jamel2', (err, decoded) => {
            if (err) {
                console.log("err");
                console.log("Token verification failed:", err.message);
                res.locals.user = null;
                return res.redirect("/login");  // إعادة التوجيه في حال فشل التحقق
            }

            const email = decoded.email;
            const sql = 'SELECT * FROM employees WHERE employee_email = ?';
            console.log(" db.query");
            db.query(sql, [email], async (err, results) => {
                if (err) {   console.log(" db.query err");
                    console.error("Error fetching employee data: " + err);
                    res.locals.user = null;
                    return res.redirect("/login"); // إعادة التوجيه إذا كانت هناك مشكلة في قاعدة البيانات
                }

                if (results.length === 0) {
                    console.log("No employee found with the provided email: " + email);
                    res.locals.user = null;
                    return res.redirect("/login"); // إعادة التوجيه إذا لم يتم العثور على المستخدم
                } else {
                    const stores=await getStoreData();
                    res.locals.user = results[0];
                      const store = stores.find(store => store.StoreID === results[0].storeID);
                      res.locals.store = store;
                    console.log("User found and authenticated:", res.locals.user);
                    next(); // تابع التنفيذ إذا تم التحقق بنجاح
                }
            });
        });
    } else {
        console.log("No token found");
        res.locals.user = null;
        res.redirect("/login");  // إعادة التوجيه إذا لم يكن هناك رمز
    }
};




module.exports = {
    signoutcontroler,
    logincontroler,
    loginpostcontroller,
    post_profileIme,
    checkIfUser,
    requireAuth,
    signupcontroler,
    checkAuthAndFetchUser
};





const hasesword=async(password)=> {
  hashedPassword = await bcrypt.hash(password, 10);
  console.log("hashed password : "+hashedPassword)
} 