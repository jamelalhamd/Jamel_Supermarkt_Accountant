const bcrypt = require("bcrypt");
const express = require('express');
var jwt = require("jsonwebtoken");
const db = require('../controller/db');
const bodyParser = require('body-parser');
const { check, validationResult } = require("express-validator");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;

const logincontroler = (req, res) => {
    console.log("sign in 1111111111111111111111111");
    res.render("authen/signin" ,{currentPage:"signin"});
};

const signupcontroler = (req, res) => {
   res.redirect('/add');
};

const loginpostcontroller =  async (req, res) => {
    const { email, password } = req.body;
    console.log("body: " + email);
    
    const sql = 'SELECT * FROM employees WHERE employee_email = ?';

    db.query(sql, [email], async (err, results) => {
        if (err) {
            console.error("Error fetching employee data: " + err);
            return res.render("authen/signin", {
                currentPage: "signin",
                message: "Error fetching employee data. Please try again later."
            });
        }

        if (results.length === 0) {
            console.log("No employee found with the provided email: " + email);
            return res.render("authen/signin", {
                currentPage: "signin",
                message: "No account found with the provided email."
            });
        }

        const employee = results[0];

        try {
            const passwordMatch = await bcrypt.compare(password, employee.employee_password);

            if (!passwordMatch) {
                console.log("Invalid password for email: " + email);
                return res.render("authen/signin", {
                    currentPage: "signin",
                    message: "Incorrect password. Please try again."
                });
            }

            const token = jwt.sign({ email: employee.employee_email }, 'jamel2', { expiresIn: '1h' });
            res.cookie("jwt", token, {
                httpOnly: true,
                maxAge: 86400000,
                sameSite: 'Strict'
            });

            console.log("Successfully logged in employee: " + email);
            res.redirect('/dash');

        } catch (bcryptErr) {
            console.error("Error comparing passwords: " + bcryptErr);
            return res.render("authen/signin", {
                currentPage: "signin",
                message: "An error occurred while processing your login. Please try again."
            });
        }
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
        jwt.verify(token, process.env.SECRET_KEY || 'jamel2', (err, decoded) => {
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
        jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
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




const checkAuthAndFetchUser = (req, res, next) => {
    const token = req.cookies.jwt;

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY || 'jamel2', (err, decoded) => {
            if (err) {
                console.log("Token verification failed:", err.message);
                res.locals.user = null;
                return res.redirect("/login");  // إعادة التوجيه في حال فشل التحقق
            }

            const email = decoded.email;
            const sql = 'SELECT * FROM employees WHERE employee_email = ?';

            db.query(sql, [email], (err, results) => {
                if (err) {
                    console.error("Error fetching employee data: " + err);
                    res.locals.user = null;
                    return res.redirect("/login"); // إعادة التوجيه إذا كانت هناك مشكلة في قاعدة البيانات
                }

                if (results.length === 0) {
                    console.log("No employee found with the provided email: " + email);
                    res.locals.user = null;
                    return res.redirect("/login"); // إعادة التوجيه إذا لم يتم العثور على المستخدم
                } else {
                    res.locals.user = results[0];
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
