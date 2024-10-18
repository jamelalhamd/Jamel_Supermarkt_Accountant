
const bodyParser = require('body-parser');
const sendEMail2=require('./sendthe email');
const sendEMail=require('./sendemail');

const { check, validationResult } = require("express-validator");
require('dotenv').config();
const cloudinary = require("cloudinary").v2;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
//================================================
const { db, getStoreData ,runQuery} = require('../controller/db');
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
const restpassword = (req, res) => { 

    const data = {

        style:"danger"// You can pass a default message or leave it blank.
    };
    console.log("rest page");
    return res.render("authen/restpassword", { data });
};













const forgotPasswordController = (req, res) => {
    const { email } = req.body; // Extracting the email from the request body
    console.log("Email: " + email);
    
    const sql = 'SELECT * FROM employees WHERE employee_email = ?'; // SQL query to find the employee by email

    db.query(sql, [email], async (err, results) => { // Executing the SQL query
        if (err) {
            console.error("Database error: " + err.message);
            SENDGRID_API_KEY
        }

        if (results.length === 0) {
            console.log("No employee found with this email");
            return res.render("authen/restpassword", { data: { msg: "No employee found with email: " + email, style: "danger" } });
        }

        const employee = results[0];

        // Generate a reset token with JWT
        const token = jwt.sign({ email: employee.employee_email }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });

        // Reset password link
        const resetLink = `${req.protocol}://${req.get('host')}/reset-password/${token}`;
        console.log("Reset link: " + resetLink);

      let email = employee.employee_email;
   
      

        console.log("email: " + email);

      // await sendMail(email , 'Password to Reset ', `Click the following link to reset your password: ${resetLink}`);
 //await sendEMail2(email , 'Password to Reset ', `Click the following link to reset your password: ${resetLink}`);
 await sendEMail(email , 'Password to Reset ', `Click the following link to reset your password: ${resetLink}`);
        return res.render("authen/restpassword", { data: { msg: `The link has been successfully sent to your email : ${email} `, style: "success" } });



    });
};



module.exports = forgotPasswordController; // Export the controller for use in other parts of the application




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


const changepassword=(req, res,) => {
    const user= res.locals.user;
    console.log(user);
    data={
  
   title:'authen/changepassword',
   msg:null,
   style:"success"
  
  
  
    }
  
  res.render('home', {data,user});
  
  
   }


   const changepasswordpost = async (req, res) => {
    const user = res.locals.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;
    console.log(req.body);
    console.log("user",JSON.stringify(user));
    console.log("user.email"+user.employee_email);
  
   
    if (!currentPassword || !newPassword || !confirmPassword) {
      const data = {
        title: 'authen/changepassword',
        msg: "Fill all fields",
        style: "danger",
      };
      return res.render('home', { data, user });
    }
  

    if (newPassword !== confirmPassword) {
      const data = {
        title: 'authen/changepassword',
        msg: "The passwords do not match",
        style: "danger",
      };
      return res.render('home', { data, user });
    }
  
    // التحقق من صحة كلمة المرور الجديدة باستخدام Regex
    const isValidPassword = (newPassword) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
        return passwordRegex.test(newPassword);
      };
  
    if (!isValidPassword(newPassword)) {
      const data = {
        title: 'authen/changepassword',
        msg: 'Invalid password format. Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.',
        style: "danger",
      };
      return res.render('home', { data, user });
    }
  
  const hassedpassword=user.employee_password;


//================================================================

const emailsql = "SELECT * FROM employees WHERE employee_email = ?";
const result = await runQuery(emailsql, [user.employee_email]);
 console.log("result: " ,JSON.stringify(result));
 console.log("result[0].length :"+result.length)
if (result.employee_email!=user.employee_email) {
    const data = {
        title: 'authen/changepassword',
        msg: "This is not your email. You can change the password for your email only.",
        style: "danger",
    };

    return res.render('home', { data, user });
}



const sqlUpdatePassword = "UPDATE employees SET employee_password = ? WHERE employee_email  = ?";




bcrypt.compare(currentPassword, hassedpassword, (err, passwordMatch) => {
    if (err) {
        const data = {
            title: 'authen/changepassword',
            msg: 'Ther is error '+err,
            style: "danger",
          };
          return res.render('home', { data, user });
    }

    if (!passwordMatch) {
        const data = {
            title: 'authen/changepassword',
            msg: "Inocorrect password ,try again",
            style: "danger",
          };
          return res.render('home', { data, user });
    }

    // Generate a JWT token with a 1-hour expiration

});
//=================================================
     


 
  if ( newPassword.trim() !== '') {
   const  hashedPassword = await bcrypt.hash( newPassword, 10);
   
   const sqlUpdatePassword = "UPDATE employees SET employee_password = ? WHERE employee_email  = ?";
   await runQuery(sqlUpdatePassword, [hashedPassword, user.employee_email]);
  }
  

  
    const data = {
      title: 'authen/changepassword',
      msg: "Password successfully changed",
      style: "success",
    };
  
    return res.render('home', { data, user });
  };
  






module.exports = {
    signoutcontroler,changepassword,changepasswordpost,
    logincontroler,
    loginpostcontroller,
    post_profileIme,
    checkIfUser,
    requireAuth,forgotPasswordController ,
    restpassword,
    signupcontroler,
    checkAuthAndFetchUser
};





const hasesword=async(password)=> {
  hashedPassword = await bcrypt.hash(password, 10);
  console.log("hashed password : "+hashedPassword)
} 