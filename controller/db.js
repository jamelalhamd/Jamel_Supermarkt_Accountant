const mysql = require('mysql');
const jwt = require('jsonwebtoken');
// Create the database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'j_hamad83',
  password: 'Afpc1967#',
  database: 'supermarkt_db'
});

// Connect to the database
db.connect((err) => {
  if (err) {
    throw err;
  }
  console.log('Connected to MySQL database');
});

// Fetch store data
const getStoreData = () => {
  return new Promise((resolve, reject) => {
    const storeQuery = 'SELECT * FROM store';
    db.query(storeQuery, (err, storeResults) => {
      if (err) {
        console.error("Error fetching store data: " + err);
        return reject("Error fetching store data: " + err);
      }
      resolve(storeResults);
    });
  });
};

const getSupplierData = () => {
  return new Promise((resolve, reject) => {
    const supplierQuery = 'SELECT * FROM supplier'; // Query to fetch all suppliers
    db.query(supplierQuery, (err, supplierResults) => {
      if (err) {
        console.error("Error fetching supplier data: " + err);
        return reject("Error fetching supplier data: " + err);
      }
      resolve(supplierResults);
    });
  });
};



const getUser = (req, res) => {
  const token = req.cookies.jwt;

  if (token) {
    jwt.verify(token, process.env.SECRET_KEY || 'jamel2', (err, decoded) => {
      if (err) {
        res.locals.user = null;
        return;
      }

      const email = decoded.email;
      const sql = 'SELECT * FROM employees WHERE employee_email = ?';
      
      db.query(sql, [email], (err, results) => {
        if (err) {
          res.locals.user = null;
          return;
        }

        if (results.length === 0) {
          res.locals.user = null;
        } else {
          res.locals.user = results[0];
          return res.locals.user;
        }
      });
    });
  } else {
    res.locals.user = null;
  }
};



const getPromotionData = () => {
  return new Promise((resolve, reject) => {
    const promotionQuery = 'SELECT * FROM promotion'; 
    db.query(promotionQuery, (err, promotionResults) => {
      if (err) {
        console.error("Error fetching promotion data: " + err);
        return reject("Error fetching promotion data: " + err); 
      }
      resolve(promotionResults); 
    });
  });
};





module.exports = {
  db,getPromotionData,
  getUser,
  getStoreData,
  getSupplierData
};
