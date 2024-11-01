const bcrypt = require('bcrypt');
const { db, getStoreData,getEmployees ,runQuery} = require('../controller/db');

// Helper function to fetch store data


const errorcontroller = (req, res) => {
  const data = { title: '404', user: req.user };
  res.render('home', { data });
};

const addcontroller = async (req, res) => {
  try {
    const storeResults = await getStoreData();
    console.log("Successfully fetched store data");
    const data = { title: 'add', stores: storeResults };
    console.log("store data: " + JSON.stringify(storeResults, null, 2));
    res.render('home', { data });
  } catch (err) {
    const data = { title: 'dashboard', user: err };
    res.render('home', { data });
  }
};

const addcontroller_post = async (req, res) => {
  try {
    const storeResults = await getStoreData();
    const stores=await getStoreData();
const employees=await getEmployees();
    
    const { firstname, lastname, phone, gender, address, password, email, role, store } = req.body;
    if (!firstname || !lastname || !gender || !password || !email || !role || !store || !address) {
      const data = { title: 'add', user: "All fields are required", stores: storeResults ,

msg:"All fields are required",style:"warning"

      };
      return res.render('home', { data });
    }


    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!isValidEmail(email)) {



     const data = {
      title: 'add',
      stores,employees,
     msg:'Invalid email format'   ,
     style:"danger"
   };
   return res.render('home', { data });

  
  
    
    }

    const isValidPassword = (password) => {
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      return passwordRegex.test(password);
    };

    if (!isValidPassword(password)) {
      const data = {
        title: 'add',
        stores,
        employees,
        msg: 'Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.',
        style: 'danger'
      };
      return res.render('home', { data });
    }




    const sqlemail = 'SELECT * FROM employees WHERE employee_email = ?';
    db.query(sqlemail, [email], async (err, result) => {
      if (err) {
        console.error("Error checking email: " + err);
        const data = {
           title: 'add',
           user,
          msg:"Error checking email, select another email " ,
          style:"danger"
        };
        return res.render('home', { data });
      }

      if (result.length > 0) {
        const data = { title: 'add', user: "The email is already used", stores: storeResults,msg: "The email is already used",style:"warning"};
        return res.render('home', { data });
      }

      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (err) {
        console.error("Error hashing password: " + err);
        const data = { title: 'add', user: "Error hashing password: " + err, stores: storeResults };
        return res.render('home', { data });
      }

      const newEmployee = {
        employee_name: firstname,
        employee_lastname: lastname,
        employee_phone: phone,
        employee_gender: gender,
        employee_address: address,
        employee_password: hashedPassword,
        employee_email: email,
        employee_role: role,
        storeID: store,
      };

      const sql = `INSERT INTO employees 
        (employee_name, employee_lastname, employee_phone, employee_gender, employee_address, employee_password, employee_email, employee_role, storeID) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;

      db.query(sql, Object.values(newEmployee), async (err) => {
        if (err) {
          console.error("Error inserting employee data: " + err);
          const data = { title: 'add', user: "Error inserting employee data: " + err, stores: storeResults };
          return res.render('home', { data });
        }
//================================================================
const stores=await getStoreData();
const employees=await getEmployees();
const data = {
  title: 'dashboard',
  employees,
  msg:"User has been succesfully added",
  style:"success",
  stores,

};
res.render('home', { data });
//================================================================
    
      });
    });
  } catch (err) {
    const data = { title: 'add', user: err, stores: [] ,msg:err };
    res.render('home', { data });
  }
};

const editcontroller_post = async (req, res) => {
  const { firstname, lastname, phone, gender, address, password, email, role } = req.body;

  const stores=await getStoreData();
  const employees=await getEmployees();

  // Input validation (Example: email validation)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail(email)) {



   const data = {
    title: 'edit',
    employees,
    stores,
   msg:'Invalid email format'   ,
   style:"danger"
 };
 return res.render('home', { data });


  
  }

  const isValidPassword = (password) => {
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])[A-Za-z\d!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]{8,}$/;
    return passwordRegex.test(password);
  };

  if (!isValidPassword(password)) {
    const data = {
      title: 'edit',
      employees,
      stores,
     msg:'Invalid password format'   ,
     style:"danger"
   };
    return res.render('home', { data });
  }

  let hashedPassword = '';
  try {
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      hashedPassword = req.currentPassword; // Assuming you get the current password from the DB in earlier middleware
    }
  } catch (err) {
    console.error("Error hashing password: " + err);
    return res.render('home', { title: 'edit', user: 'Error hashing password', msg:"Error hashing password "+err });
  }

  const updatedEmployee = {
    employee_name: firstname,
    employee_lastname: lastname,
    employee_phone: phone,
    employee_gender: gender,
    employee_address: address,
    employee_password: hashedPassword,
    employee_email: email,
    employee_role: role,
  };

  console.log("ROLE: " + updatedEmployee.employee_role);
  console.log("updatedEmployee: ", updatedEmployee);

  const sql = `UPDATE employees SET 
    employee_name = ?, 
    employee_lastname = ?, 
    employee_phone = ?, 
    employee_gender = ?, 
    employee_address = ?, 
    employee_password = ?, 
    employee_role = ? 
    WHERE employee_email = ?`;

  db.query(sql, [
    updatedEmployee.employee_name,
    updatedEmployee.employee_lastname,
    updatedEmployee.employee_phone,
    updatedEmployee.employee_gender,
    updatedEmployee.employee_address,
    updatedEmployee.employee_password,
    updatedEmployee.employee_role,
    email
  ], async (err) => {
    if (err) {
      console.error("Error updating employee data: " + err);
      return res.render('home', { title: 'edit', user: "Error updating employee data: " + err ,msg:"Error updating employee data: " + err  });
    }

 
const stores=await getStoreData();
const employees=await getEmployees();
const data = {
  title: 'dashboard',
  employees,
  msg:`User with email : ${email}  has been succesfully Updated`,
  style:"success",
  stores,

};
res.render('home', { data });
  });
};

const deletecontroller_post = (req, res) => {
  const id = req.params.id;
  console.log("id: " + id);

  const sql = 'DELETE FROM employees WHERE employee_id = ?';
  db.query(sql, [id],  async (err, results) => {
    if (err) {
      console.error("Error deleting employee data: " + err);
      const stores=await getStoreData();
      const employees=await getEmployees();
      const data = {
        title: 'dashboard',
        employees,
        msg:"Error deleting employee data: " + err,
        style:"danger",
        stores,
      
      };
      res.render('home', { data });
    }

    if (results.affectedRows === 0) {
      console.log("No employee found with ID: " + id);
      const stores=await getStoreData();
      const employees=await getEmployees();
      const data = {
        title: 'dashboard',
        employees,
        msg:"No employee found with ID: " + id,
        style:"danger",
        stores,
      
      };
      res.render('home', { data });
    }

    console.log("Successfully deleted employee data for ID: " + id);
    const stores=await getStoreData();
    const employees=await getEmployees();
    const data = {
      title: 'dashboard',
      employees,
      msg:"Successfully deleted employee data for ID: " + id,
      style:"danger",
      stores,
    
    };
    res.render('home', { data });
  });
};

const covercontroller = (req, res) => {
  console.log("cover");
  res.render("cover");
};

const dashcontroller = async (req, res) => {


  try {
    const [employeeResults, storeResults] = await Promise.all([
      new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM employees';
        db.query(sql, (err, results) => {
          if (err) {
            console.error("Error fetching employee data: " + err);
            return reject("Error fetching employee data: " + err);
          }
          resolve(results);
        });
      }),
      getStoreData()
    ]);

    console.log("Successfully fetched data");
    const data = {
      title: 'dashboard',
      employees: employeeResults,
      stores: storeResults,
   
    };
    console.log("store data: " + JSON.stringify(storeResults, null, 2));
    res.render('home', { data });
  } catch (err) {
    const data = { title: 'dashboard', user: err };
    res.render('home', { data });
  }
};

const editcontroller = async (req, res) => {
  const { id } = req.params;

  try {
    const [employeeResults, storeResults] = await Promise.all([
      new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM employees WHERE employee_id = ?';
        db.query(sql, [id], (err, results) => {
          if (err) {
            console.error("Error fetching employee data: " + err);
            return reject("Error fetching employee data: " + err);
          }
          resolve(results);
        });
      }),
      getStoreData()
    ]);

    if (employeeResults.length === 0) {
      console.log("No employee found with ID: " + id);
      const data = { title: 'dashboard', employees: [] };
      return res.render('home', { data, message: 'No employee found' });
    }

    console.log("Successfully fetched data");
    const data = {
      title: 'edit',
      employees: employeeResults,
      stores: storeResults
    };

    res.render('home', { data });
  } catch (err) {
    const data = { title: 'edit', user: err };
    res.render('home', { data });
  }
};

const homecontroller = (req, res) => {
  const data = null;
  res.render('home', { data });
};

const viewcontroller = async (req, res) => {
  const { id } = req.params;

  try {
    const storeResults = await getStoreData();
    const employeeResults = await new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM employees WHERE employee_id = ?';
      db.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error fetching employee data: " + err);
          return reject("Error fetching employee data: " + err);
        }
        resolve(results);
      });
    });

    if (employeeResults.length === 0) {
      console.log("No employee found with ID: " + id);
      const data = { title: 'dashboard', employees: [] };
      return res.render('home', { data, message: 'No employee found' });
    }

    console.log("Successfully fetched employee data for ID: " + id);
    const data = { title: 'view', employees: employeeResults,storedetails:storeResults  };
    console.log("Employees data: " + JSON.stringify(employeeResults, null, 2));
    return res.render('home', { data });
  } catch (err) {
    const data = { title: 'view', user: err };
    res.render('home', { data });
  }
};

const searchcontroller = async (req, res) => {
  const id = req.body.search;

  try {
    const [employeeResults, storeResults] = await Promise.all([
      new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM employees WHERE employee_id = ? OR employee_name = ? OR employee_lastname = ? OR employee_email = ? OR employee_phone = ?';
        db.query(sql, [id, id, id, id, id], (err, results) => {
          if (err) {
            console.error("Error fetching employee data: " + err);
            return reject("Error fetching employee data: " + err);
          }
          resolve(results);
        });
      }),
      getStoreData()
    ]);

    if (employeeResults.length === 0) {
      console.log("No employee found for search term: " + id);
      const data = { title: 'dashboard', employees: [] };
      return res.render('home', { data, message: 'No employee found' });
    }

    console.log("Successfully fetched data");
    const data = {
      title: 'dashboard',
      employees: employeeResults,
      stores: storeResults
    };
    console.log("store data: " + JSON.stringify(storeResults, null, 2));
    res.render('home', { data });
  } catch (err) {
    const data = { title: 'dashboard', user: err };
    res.render('home', { data });
  }
};
























module.exports = {
  errorcontroller,
  addcontroller,
  covercontroller,
  dashcontroller,
  editcontroller,
  homecontroller,
  viewcontroller,
  addcontroller_post,
  editcontroller_post,
  deletecontroller_post,
  searchcontroller
};
