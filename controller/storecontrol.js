
const { db, getStoreData } = require('../controller/db');


const storeviewcontrol = async (req, res) => { 
  try {
    const stores = await getStoreData(); // Await the result of the asynchronous function
    const data = { title: "store/dashboard", stores: stores }; // Pass stores data to the template
    console.log(stores);
    
    res.render('home', { data }); // Render the 'home' view with the data
  } catch (err) {
    console.error("Error fetching store data:", err);
    res.status(500).send('Server error'); // Handle errors appropriately
  }
};





const searchcontroller = async (req, res) => {
    console.log("0");
    const searchTerm = req.body.search ? req.body.search : 1;

 console.log("searchTerm :"+searchTerm);
 console.log("1");
  try {
    const [storeResults] = await Promise.all([
      new Promise((resolve, reject) => {
        const sql = 'SELECT * FROM store WHERE StoreID = ? OR StoreName LIKE ?';
        db.query(sql, [searchTerm, `%${searchTerm}%`], (err, results) => {
          if (err) {
            console.error("Error fetching store data: " + err);
            return reject("Error fetching store data: " + err);
          }
          resolve(results);
        });
      })
    ]);

    if (storeResults.length === 0) {
      console.log("No store found for search term: " + searchTerm);
      const data = { title: 'store/dashboard', stores: [] };
      return res.render('home', { data, message: 'No store found' });
    }

    console.log("Successfully fetched store data");
    const data = {
      title: 'store/dashboard',
      stores: storeResults
    };
    console.log("store data: " + JSON.stringify(storeResults, null, 2));
    res.render('home', { data });
  } catch (err) {
    const data = { title: 'store/dashboard', error: err };
    res.render('home', { data });
  }
};





// Render the edit page for the store
const editStore = (req, res) => {
  const storeId = req.params.id;
  console.log("0");
  const sql = 'SELECT * FROM store WHERE StoreID = ?';
  db.query(sql, [storeId], (err, results) => {
    if (err) {
        console.log("1");
      console.error("Error fetching store data: " + err);
      return res.redirect('/storeview');
    }

    if (results.length === 0) {
        console.log("2");
        return res.redirect('/storeview');
    }

    const data = {
       
      title: 'store/edit',
      store: results[0]
    };

   

    
    res.render('home', { data });



  
  });
};



// Handle updating the store details
const updateStore = (req, res) => {
  const storeId = req.params.id;
  const { StoreName, Location, Address } = req.body;

  const sql = 'UPDATE store SET StoreName = ?, Location = ?, Address = ? WHERE StoreID = ?';
  db.query(sql, [StoreName, Location, Address, storeId], (err) => {
    if (err) {
      console.error("Error updating store data: " + err);
      const data = { title: 'store/add',
        user:"Error updating store data: " + err,
        style:"danger"
     };
          
      return   res.render('home', { data });
    }
    const data = { title: 'store/add',user:"User has been sucessfully edited" , style:"success"};
          
            return   res.render('home', { data }); // Redirect back to the store view after successful update
  });
};

















const addStore = async (req, res) => {
    const { StoreName, Location, Address } = req.body;

    // Validate input data
    if (!StoreName || !Location || !Address) {
        return res.status(400).send("All fields are required.");
    }

    const sql = 'INSERT INTO store (StoreName, Location, Address) VALUES (?, ?, ?)';

    try {
        // Use a prepared statement to prevent SQL injection
        db.query(sql, [StoreName, Location, Address], (err, results) => {
            if (err) {
                console.error("Error inserting store: " + err);
               const data = { title: 'store/add',user:"User has been not added" ,   style:"danger"};
               return  res.render('home', { data });
            }
            // Redirect or send a success message
            const data = { title: 'store/add',user:"User has been sucessfully added",   style:"success" };
          
            return   res.render('home', { data });// Redirect to store view with success message
        });
    } catch (err) {
        console.error("Error handling request: " + err);
        res.status(500).send("Server error");
    }
};






const deleteStore = (req, res) => {
    const storeId = req.params.id;
  
    if (!storeId) {
      // Handle the case where no storeId is provided
      const data = {
        title: 'store/add',
        user: 'No store ID provided for deletion'
      };
      return res.render('home', { data });
    }
  
    console.log("Deleting store with ID: " + storeId);
  
    const sql = 'DELETE FROM store WHERE StoreID = ?';
    db.query(sql, [storeId], (err, result) => {
      if (err) {
        console.error("Error deleting store: " + err);
        const data = {
          title: 'store/add',
          user: 'Error occurred while deleting the store'
        };
        return res.render('home', { data });
      }
  
      if (result.affectedRows === 0) {
        // No rows were affected, meaning no store was deleted
        const data = {
          title: 'store/add',
          user: 'No store found with the given ID',
             style:"danger"
        };
        return res.render('home', { data });
      }
  
      // Successful deletion
      const data = {
        title: 'store/add',
        user: 'Store has been successfully deleted',
           style:"danger"
      };
      res.render('home', { data });
    });
  };
  
  

  const addStorepage  = (req, res) => {




const data = { title: 'store/add' };
res.render('home', { data });
  }






         module.exports = {storeviewcontrol,searchcontroller ,editStore,updateStore,deleteStore,addStore,addStorepage }