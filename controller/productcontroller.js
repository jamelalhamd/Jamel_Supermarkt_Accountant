
const db = require('../controller/db');
const errorcontroller = (req, res) => {
  
  const data={title:'404' ,user: req.user};
  res.render('home',{data: data});
 }

const addcontroller = (req, res) => { 
  
  
  const storeQuery = `SELECT * FROM store`;
    db.query(storeQuery, (err, storeResults) => {
      if (err) {
        console.error("Error fetching store data: " + err);
        const data = { title: 'dashboard', user: "Error fetching store data: " + err };
        return res.render('home', { data });
      }
  
      console.log("Successfully fetched store data");

      // Prepare data for the view
      const data = {
        title: 'add',
     
        stores: storeResults
      };
      console.log("store data: " + JSON.stringify(  storeResults, null, 2)); 
      // Render the home view with the fetched data
      res.render('home', { data });
    });




}



const addcontroller_post = async (req, res) => {

  const storeQuery = `SELECT * FROM store`;
  db.query(storeQuery, (err, storeResults) => {
    if (err) {
      console.error("Error fetching store data: " + err);
      const data = { title: 'dashboard', user: "Error fetching store data: " + err };
      return res.render('home', { data });
    }

   

    const { firstname, lastname, phone, gender, address, password, email, role, store } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !gender || !password || !email || !role || !store || !address) {
  
  
      const data = {
        title: 'add',
  user:"All field required",
        stores: storeResults
      };
     return res.render('home',{data})
  
  
    }
  
    
    const sqlemail = `SELECT * FROM employees WHERE employee_email = ?`;
    db.query(sqlemail, [email], async (err, result) => {
      if (err) {
        console.error("Error checking email: " + err);
        const data = {
          title: 'add',
    user:"Error checking email,select anothe email " + err,
          stores: storeResults
        };
      return  res.render('home',{data})
      }
  
      if (result.length > 0) {
        const data = {
          title: 'add',
    user:"The email already Used: " ,
          stores: storeResults
        };
      return  res.render('home',{data})
      }
  
      // Hash the password
      let hashedPassword;
      try {
        hashedPassword = await bcrypt.hash(password, 10);
      } catch (err) {
        console.error("Error hashing password: " + err);
        const data = {
          title: 'add',
    user:"Error hashing password: " + err,
          stores: storeResults
        };
      return  res.render('home',{data})
      }
  
      // Create new employee object
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
  
      // Insert the employee into the database
      const sql = `INSERT INTO employees 
      (employee_name, employee_lastname, employee_phone, employee_gender, employee_address, employee_password, employee_email, employee_role, storeID) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
      db.query(sql, Object.values(newEmployee), (err, result) => {
        if (err) {
          console.error("Error inserting employee data: " + err);
          const data = {
            title: 'add',
      user:"Error inserting employee data: " + err,
            stores: storeResults
          };
        return  res.render('home',{data})
        }
  
        const data = {
          title: 'add',
    user:"User successfully added " ,
          stores: storeResults
        };
      return  res.render('home',{data}) // Redirect to dashboard after successful insertion
      });
    });
    
  
  });











  
};




const bcrypt = require('bcrypt'); // Import bcrypt


const editcontroller_post = async (req, res) => {
  const { firstname, lastname, phone, gender, address, password, email, role } = req.body;
  console.log("ROLE UP: " + role);

  // Input validation (Example: email validation)
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Hash the password if provided
  let hashedPassword = '';
  try {
    if (password && password.trim() !== '') {
      hashedPassword = await bcrypt.hash(password, 10);
    } else {
      // If password not provided, keep the current one
      hashedPassword = req.currentPassword; // Assuming you get the current password from the DB in earlier middleware
    }
  } catch (err) {
    console.error("Error hashing password: " + err);
    return res.render('home', { title: 'edit', user: 'Error hashing password' });
  }

  // Create employee object for updating
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

  // SQL query to update the employee based on the email
  const sql = `
    UPDATE employees SET 
      employee_name = ?, 
      employee_lastname = ?, 
      employee_phone = ?, 
      employee_gender = ?, 
      employee_address = ?, 
      employee_password = ?, 
      employee_role = ? 
    WHERE employee_email = ?
  `;

  // Execute the query with updated employee data
  db.query(sql, [
    updatedEmployee.employee_name,
    updatedEmployee.employee_lastname,
    updatedEmployee.employee_phone,
    updatedEmployee.employee_gender,
    updatedEmployee.employee_address,
    updatedEmployee.employee_password,
    updatedEmployee.employee_role,
    email // Corrected email placement
  ], (err, result) => {
    if (err) {
      console.error("Error updating employee data: " + err);
      return res.render('home', { title: 'edit', user: "Error updating employee data: " + err });
    }

    console.log("Successfully updated employee");
    return res.redirect('/dash');
  });
};


  




const deletecontroller_post = (req, res) => {

const id = req.params.id
console.log("id: " + id);

  const sql = 'DELETE FROM employees WHERE employee_id = ?';

  // Execute the query
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error deleting employee data: " + err);
      const data = { title: 'dash', user: "Error deleting employee data: " + err };
      return res.render('home', { data });
    }

    // Check if any rows were affected
    if (results.affectedRows === 0) {
      console.log("No employee found with ID: " + id);
      const data = { title: 'edit', employees: [] };
      return res.render('home', { data, message: 'No employee found to delete' });
    }

    console.log("Successfully deleted employee data for ID: " + id);

   res.redirect('/dash');
  });


}

  

const covercontroller = (req, res) => { 
  console.log("cover");
   res.render("cover");
 }


const dashcontroller = (req, res) => {


  const sql = `SELECT * FROM employees`;

  // Execute the query
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching employee data: " + err);
      const data = { title: 'employees', user: "Error fetching employee data: " + err };
      return res.render('home', { data });
    }
//================================================================
    const storeQuery = `SELECT * FROM store`;
    db.query(storeQuery, (err, storeResults) => {
      if (err) {
        console.error("Error fetching store data: " + err);
        const data = { title: 'dashboard', user: "Error fetching store data: " + err };
        return res.render('home', { data });
      }
  
      console.log("Successfully fetched store data");

      // Prepare data for the view
      const data = {
        title: 'dashboard',
        employees: results,
        stores: storeResults
      };
      console.log("store data: " + JSON.stringify(  storeResults, null, 2)); 
      // Render the home view with the fetched data
      res.render('home', { data });
    });

//================================================================


   
  });




   
 }

const editcontroller = (req, res) => { 
  const { id } = req.params;

  // Use parameterized query to prevent SQL injection
  const sql = 'SELECT * FROM employees WHERE employee_id = ?';

  // Execute the query
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching employee data: " + err);
      const data = { title: 'employees', user: "Error fetching employee data: " + err };
      return res.render('home', { data });
    }

    // Check if any employee was found
    if (results.length === 0) {
      console.log("No employee found with ID: " + id);
      const data = { title: 'dashboard', employees: [] };
      return res.render('home', { data, message: 'No employee found' });
    }

    const storeQuery = `SELECT * FROM store`;
db.query(storeQuery, (err, storeResults) => {
  if (err) {
    console.error("Error fetching store data: " + err);
    const data = { title: 'dashboard', user: "Error fetching store data: " + err };
    return res.render('home', { data });
  }

  console.log("Successfully fetched store data");

  // Prepare data for the view
  const data = {
    title: 'edit',
    employees: results,
    stores: storeResults
  };
  console.log("store data: " + JSON.stringify(  storeResults, null, 2)); 
  // Render the home view with the fetched data
  res.render('home', { data });
});

//================================================================

   
  });

 }
const homecontroller = (req, res) => { 
    const data=null
res.render('home',{data: data}); 
}



const viewcontroller = (req, res) => {
  const { id } = req.params;

  // Use parameterized query to prevent SQL injection
  const sql = 'SELECT * FROM employees WHERE employee_id = ?';

  // Execute the query
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error fetching employee data: " + err);
      const data = { title: 'employees', user: "Error fetching employee data: " + err };
      return res.render('home', { data });
    }

    // Check if any employee was found
    if (results.length === 0) {
      console.log("No employee found with ID: " + id);
      const data = { title: 'dashboard', employees: [] };
      return res.render('home', { data, message: 'No employee found' });
    }

    console.log("Successfully fetched employee data for ID: " + id);
    const data = { title: 'view', employees: results };

    console.log("Employees data: " + JSON.stringify(results, null, 2)); 
    return res.render('home', { data });
  });
};


const searchcontroller = (req, res) => {
  const id = req.body.search;
  const sql = 'SELECT * FROM employees WHERE employee_id = ? OR employee_name = ? OR employee_lastname = ? OR employee_email = ? OR employee_phone = ?';

  // Execute the query
  db.query(sql, [id, id, id, id, id], (err, results) => {
    if (err) {
      console.error("Error fetching employee data: " + err);
      const data = { title: 'dashboard', user: "Error fetching employee data: " + err };
      return res.render('home', { data });
    }

    // Check if any employee was found
    if (results.length === 0) {
      console.log("No employee found for search term: " + id);
      const data = { title: 'dashboard', employees: [] };
      return res.render('home', { data, message: 'No employee found' });
    }


//================================================================
const storeQuery = `SELECT * FROM store`;
db.query(storeQuery, (err, storeResults) => {
  if (err) {
    console.error("Error fetching store data: " + err);
    const data = { title: 'dashboard', user: "Error fetching store data: " + err };
    return res.render('home', { data });
  }

  console.log("Successfully fetched store data");

  // Prepare data for the view
  const data = {
    title: 'dashboard',
    employees: results,
    stores: storeResults
  };
  console.log("store data: " + JSON.stringify(  storeResults, null, 2)); 
  // Render the home view with the fetched data
  res.render('home', { data });
});

//================================================================



  


    
  });
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
