const { db,
    getPromotionData,
    categoriesArray ,
    getItemData,
    getSupplierData,
    itemStatesArray,
    unitsArray,
    getEmployees,
    getpurchesesinvoice ,
    getBysalesinvoiceitemID ,
    getStoreData,
    fetchIteminvoice,getUser,
    getInvoiceById,
    getInvoiceItemsById,
    getInvoice,
     runQuery} = require('./db');
  


const nostock=async(req,res) => {  
    
    const Promotion=await getPromotionData();
    const stores=await getStoreData();
  

 const sql="select * from item where quantity=0 "

 const items=await runQuery(sql);
 console.log("nostock",JSON.stringify(items));


 const data = { title: "alarm/nostock",
    items,
    stores:stores,
    promotions:Promotion,
    msg:""
    };


 res.render('home', { data });





};


const back= (req, res) => {
    const referer = req.get("referer");
     console.log("referer = ");
    if (referer) {
      res.redirect(referer); // Redirect to the referring page
    } else {
    //  res.redirect("/items"); // Fallback to a default page if no referer is found
    }
  };


const searchItemController = async (req, res) => {
    try {
      // Fetch promotions and stores
      const promotions = await getPromotionData();
      const stores = await getStoreData();
  
      // Fetch search term from the request body
      const searchTerm = req.body.search || '';
  
      // Prepare SQL query
      const sql = `
  SELECT * FROM item 
WHERE (ItemID = ? OR ItemName LIKE ? OR Barcode = ?) 
AND quantity = 0

      `;
      const searchQuery = `%${searchTerm}%`; // Create a pattern for LIKE search
  
      // Execute the SQL query
      const itemResults = await new Promise((resolve, reject) => {
        db.query(sql, [searchTerm, searchQuery, searchTerm], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      // Check if items were found
      if (itemResults.length === 0) {
        const data = {
            title: "alarm/nostock",
          items: [],
          stores: stores,
          promotions: promotions,
          msg: 'No items found'
        };
        return res.render('home', { data });
      }
  
      // Prepare data for rendering
      const data = {
        title: "alarm/nostock",
        items: itemResults,
        stores: stores,
        promotions: promotions
      };
      return res.render('home', { data });
  
    } catch (err) {
      console.error("Error in item search: " + err);
      const data = {
        title: "alarm/nostock",
        items: [],
        stores: [],
        promotions: [],
        msg: "Error retrieving item data"
      };
      return res.render('home', { data });
    }
  };








  const deleteItemPage = async(req, res) => {
    const itemId = req.params.id;
  
    try {
      // Fetch promotions and stores
      const promotions = await getPromotionData();
      const stores = await getStoreData();
  
      // Fetch the specific item from the database
      const sql = 'SELECT * FROM item WHERE ItemID = ?';
      const itemResults = await new Promise((resolve, reject) => {
        db.query(sql, [itemId], (err, results) => {
          if (err) {
            return reject(err);
          } else {
            resolve(results);
          }
        });
      });
  
      // If no item is found, redirect to the items list
      if (itemResults.length === 0) {
        return res.redirect('/nostock');
      }
  
      // Get the specific item
      const item = itemResults[0];
  
      // Get the selected store and promotion IDs
      const selectedStoreID = item.StoreID;
      const selectedPromotionID = item.PromotionID;
  
      // Prepare data for rendering the edit form
      const data = {
          title: 'alarm/delete',   
        item: item,
        stores: stores,
        categories: categoriesArray,units:unitsArray,states:itemStatesArray,
        promotions: promotions,
        selectedStoreID: selectedStoreID,
        selectedPromotionID: selectedPromotionID,
        csrfToken: req.csrfToken ? req.csrfToken() : "",  // If CSRF is being used
        msg: "",  // Default empty message
        style: "" // Optional styling for alerts
      };
  
      // Render the 'home' view with the data
      res.render('home', { data });
  
    } catch (err) {
      console.error("Error fetching item data: " + err);
      // Provide a user-friendly error message and log the error for debugging
      res.status(500).send('Server error. Please try again later.');
    }
  };
//============================================================================
// Function to handle deleting an item
const deleteItem =async (req, res) => {
  const itemId = req.params.id;

  if (!itemId) {
    //  console.log("Item not found: " + itemId);
   return res.redirect("/nostock");
 
  }

  const sql = 'DELETE FROM item WHERE ItemID = ?';
  db.query(sql, [itemId],  async (err, result) => {
    if (err) {
      console.error("Error deleting item: " + err);
      console.log("Item not found: " + itemId);
      return res.redirect("/nostock");
    }
    if (result.affectedRows === 0) {
    

      console.log("'No item found with the given ID'" + itemId);
      return res.redirect("/nostock");
    }



    const Promotion=await getPromotionData();
    const stores=await getStoreData();
 const sql="select * from item where quantity=0 "
 const items=await runQuery(sql);
 console.log("nostock",JSON.stringify(items));



    const data = { title: "alarm/nostock",
      items,
      stores:stores,
      promotions:Promotion,
      msg:`Item with the given ID ${itemId}  has been successfully deleted`,
      style:"danger"
      };

      return res.render('home', { data });
    



    
  });
};

// Function to render details of a specific item
const itemViewDetails = async (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM item WHERE ItemID = ?';
  const promotions=await getPromotionData();
  const stores=await getStoreData();
  try {
    const itemResults = await new Promise((resolve, reject) => {
      db.query(sql, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
    if (itemResults.length === 0) {
        return res.redirect("/nostock");
    }
    const data = {
      title: 'alarm/view',promotions:  promotions,stores: stores, 
      item: itemResults[0]
    };
    res.render('home', { data });
  } catch (err) {
    console.error("Database error: " + err);
    return res.redirect("/nostock");
  }
};







const lowstock=async(req,res) => {  
    
    const Promotion=await getPromotionData();
    const stores=await getStoreData();
  

 const sql="select * from item where quantity < 5 "

 const items=await runQuery(sql);
 console.log("nostock",JSON.stringify(items));


 const data = { title: "alarm/nostock",
    items,
    stores:stores,
    promotions:Promotion,
    msg:""
    };


 res.render('home', { data });





};



const Expiredate = async (req, res) => {  
    try {
        const Promotion = await getPromotionData();
        const stores = await getStoreData();
        
        // Get the current date formatted for the SQL query
        const sql = "SELECT * FROM item WHERE ExpiryDate < ?";
        const date = new Date().toISOString().split('T')[0]; // Formats the date as YYYY-MM-DD
        
        const items = await runQuery(sql, [date]);
        console.log("Expired items:", JSON.stringify(items));

     const data = { title: "alarm/nostock",
    items,
    stores:stores,
    promotions:Promotion,
    msg:""
    };


 res.render('home', { data });

     
    } catch (err) {
        console.error("Error in Expiredate function:", err);
        res.status(500).send("Server Error");
    }
};


const Expiredatenearly = async (req, res) => {  
    try {
        const Promotion = await getPromotionData();
        const stores = await getStoreData();
        
        // Get the current date formatted for the SQL query
        const currentDate = new Date();
        const today = currentDate.toISOString().split('T')[0];  // Today's date in YYYY-MM-DD format
        
        // Calculate the date 20 days later from today
        const futureDate = new Date(currentDate);
        futureDate.setDate(futureDate.getDate() + 20);  // Add 20 days to today
        const after20Days = futureDate.toISOString().split('T')[0];  // 20 days later in YYYY-MM-DD format

        // SQL query to get items that expire between today and 20 days from now
        const sql = "SELECT * FROM item WHERE ExpiryDate BETWEEN ? AND ?";
        const items = await runQuery(sql, [today, after20Days]);  // Pass today first, then after20Days
        console.log("Items expiring between today and 20 days later:", JSON.stringify(items));
        console.log("Today:", JSON.stringify(today));
        console.log("20 days later:", JSON.stringify(after20Days));

        const data = { 
            title: "alarm/nostock",  // Title for expired/recently expired items
            items,
            stores: stores,
            promotions: Promotion,
            msg: ""
        };

        // Render the view with the data
        res.render('home', { data });

    } catch (err) {
        console.error("Error in Expiredatenearly function:", err);
        res.status(500).send("Server Error");
    }
};




module.exports = { nostock,back,searchItemController,itemViewDetails,deleteItem,deleteItemPage,lowstock,Expiredatenearly,Expiredate };