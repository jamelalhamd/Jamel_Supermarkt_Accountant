const { db, getSupplierData } = require('../controller/db');

// View Suppliers
const  supplierdashcontrol = async (req, res) => {
  try {
    const suppliers = await getSupplierData(); // Await the result of the asynchronous function
    const data = { title: "supplier/dashboard", suppliers: suppliers }; // Pass suppliers data to the template
    console.log(suppliers);
    
    res.render('home', { data }); // Render the 'home' view with the data
  } catch (err) {
    console.error("Error fetching supplier data:", err);
    res.status(500).send('Server error'); // Handle errors appropriately
  }
};




// Edit Supplier
const editSupplier = (req, res) => {
  const supplierId = req.params.id;
  console.log("0");
  const sql = 'SELECT * FROM supplier WHERE SupplierID = ?';
  db.query(sql, [supplierId], (err, results) => {
    if (err) {
      console.log("1");
      console.error("Error fetching supplier data: " + err);
      return res.redirect('/supplierdash');
    }

    if (results.length === 0) {
      console.log("2");
      return res.redirect('/supplierdash');
    }
    console.log("3");
    const data = {
      title: 'supplier/edit',
      supplier: results[0],
      msg:" "
    };
  
    console.log("4");
    res.render('home', { data });
    
  });
};




const deleteSupplie_get = (req, res) => {
  const supplierId = req.params.id;
  console.log("0");
  const sql = 'SELECT * FROM supplier WHERE SupplierID = ?';
  db.query(sql, [supplierId], (err, results) => {
    if (err) {
      console.log("1");
      console.error("Error fetching supplier data: " + err);
      return res.redirect('/supplierdash');
    }

    if (results.length === 0) {
      console.log("2");
      return res.redirect('/supplierdash');
    }
    console.log("3");
    const data = {
      title: 'supplier/delete',
      supplier: results[0],
      msg:" "
    };
  
    console.log("4");
    res.render('home', { data });
    
  });
};






// Update Supplier
// Update Supplier
const updateSupplier = (req, res) => {
  const supplierId = req.params.id;
  const { SupplierName, Phone, Address, Email } = req.body;
  console.log("update 1");
  // Check if any field is missing (optional but recommended)
  if (!SupplierName || !Phone || !Address || !Email) {
    const data = { title: 'supplier/edit', msg: "Please fill in all fields", style: "danger", supplier: req.body };
    return res.render('supplier/edit', { data });
  }
  console.log("update 2");
  console.log("Attempting to update supplier with ID:", supplierId);

  const sql = 'UPDATE supplier SET SupplierName = ?, Phone = ?, Address = ?, Email = ? WHERE SupplierID = ?';

  db.query(sql, [SupplierName, Phone, Address, Email, supplierId], (err) => {
    if (err) {
      console.error("Error updating supplier data:", err);
      const data = { title: 'supplier/edit', msg: "Error updating supplier data: " + err, style: "danger", supplier: req.body };
      return res.render('home', { data });
    }
    console.log("update don");
    console.log("Supplier updated successfully with ID:", supplierId);
    const data = { title: 'supplier/edit', msg: "Supplier updated successfully with ID:"+supplierId, style: "success", supplier: { SupplierID: supplierId, SupplierName, Phone, Address, Email } };
    console.log("update rerender");
    // Optionally redirect to supplier view or back to edit page
    return res.render('home', { data });
  });
};


// Add Supplier
const addSupplier = async (req, res) => {
  const { SupplierName, Phone, Address, Email } = req.body;

  // Validate input data
  if (!SupplierName || !Phone || !Address || !Email) {
    return res.status(400).send("All fields are required.");
  }

  const sql = 'INSERT INTO supplier (SupplierName, Phone, Address, Email) VALUES (?, ?, ?, ?)';

  try {
    db.query(sql, [SupplierName, Phone, Address, Email], (err, results) => {
      if (err) {
        console.error("Error inserting supplier: " + err);
        const data = { title: 'supplier/add', user: "Supplier has not been added", style: "danger" };
        return res.render('home', { data });
      }
      const data = { title: 'supplier/add', user: "Supplier has been successfully added", style: "success" };
      return res.render('home', { data });
    });
  } catch (err) {
    console.error("Error handling request: " + err);
    res.status(500).send("Server error");
  }
};

// Delete Supplier
const deleteSupplier = (req, res) => {
  const supplierId = req.params.id;

  if (!supplierId) {
    const data = { title: 'supplier/delete',user: 'No supplier ID provided for deletion' };
    return res.render('home', { data });
  }

  console.log("Deleting supplier with ID: " + supplierId);

  const sql = 'DELETE FROM supplier WHERE SupplierID = ?';
  db.query(sql, [supplierId], (err, result) => {
    if (err) {
      console.error("Error deleting supplier: " + err);
      const data = { title: 'supplier/add', user: 'Error occurred while deleting the supplier', style: "danger" };
      return res.render('home', { data });
    }

    if (result.affectedRows === 0) {
      const data = { title: 'supplier/add', user: 'No supplier found with the given ID' + supplierId, style: "danger" };
      return res.render('home', { data });
    }

    const data = { title: 'supplier/add', user: 'Supplier has been successfully deleted', style: "danger" };
    res.render('home', { data });
  });
};

// Render Add Supplier Page
const addSupplierPage = (req, res) => {
  const data = { title: 'supplier/add' };
  res.render('home', { data });
};





const supplierViewControl = async (req, res) => {
  const { id } = req.params; // Extract the supplier ID from the request parameters

  try {
    // Fetch all supplier data
    const supplierResults = await getSupplierData();

    // Fetch specific supplier data based on the ID
    const supplierDetails = await new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM supplier WHERE SupplierID = ?';
      db.query(sql, [id], (err, results) => {
        if (err) {
          console.error("Error fetching supplier data: " + err);
          return reject("Error fetching supplier data: " + err);
        }
        resolve(results);
      });
    });

    // Check if the supplier exists
    if (supplierDetails.length === 0) {
      return res.status(404).send('Supplier not found');
    }

    // Structure the data to be passed to the view
    const data = {
      title: 'supplier/view',
      suppliers: supplierResults,
      supplier: supplierDetails[0] // Pass the specific supplier data
    };

    // Render the supplier view page with the data
    res.render('supplierView', { data });

  } catch (err) {
    console.error("Error fetching supplier data: " + err);
    res.status(500).send('Server error');
  }
};



const searchSupplierController = async (req, res) => {
    console.log("0");
    const searchTerm = req.body.search ? req.body.search : 1;
  
    console.log("searchTerm :" + searchTerm);
    console.log("1");
  
    try {
      const [supplierResults] = await Promise.all([
        new Promise((resolve, reject) => {
          const sql = `
            SELECT * FROM supplier 
            WHERE SupplierID = ? 
            OR SupplierName LIKE ? 
            OR Phone LIKE ?
            OR Address LIKE ? 
            OR Email LIKE ?
          `;
          const searchQuery = `%${searchTerm}%`;
          db.query(sql, [searchTerm, searchQuery, searchQuery, searchQuery, searchQuery], (err, results) => {
            if (err) {
              console.error("Error fetching supplier data: " + err);
              return reject("Error fetching supplier data: " + err);
            }
            resolve(results);
          });
        })
      ]);
  
      if (supplierResults.length === 0) {
        console.log("No supplier found for search term: " + searchTerm);
        const data = { title: 'supplier/dashboard', suppliers: [] };
        return res.render('home', { data, message: 'No supplier found' });
      }
  
      console.log("Successfully fetched supplier data");
      const data = {
        title: 'supplier/dashboard',
        suppliers: supplierResults
      };
      console.log("supplier data: " + JSON.stringify(supplierResults, null, 2));
      res.render('home', { data });
    } catch (err) {
      const data = { title: 'supplier/dashboard', error: err };
      res.render('home', { data });
    }
  };
  


module.exports = {
    supplierViewControl,
    searchSupplierController,
  supplierdashcontrol,
  deleteSupplie_get,
  editSupplier,
  updateSupplier,
  deleteSupplier,
  addSupplier,
  addSupplierPage
};
