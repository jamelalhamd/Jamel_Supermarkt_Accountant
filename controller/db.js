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




module.exports = {
  db,getUser,
  getStoreData
};
