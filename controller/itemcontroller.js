const dayjs = require('dayjs');
const { db ,getStoreData,getPromotionData,getItemData} = require('../controller/db');
const util = require('util');

const fetch = require('node-fetch');
// Promisify the db.query method to use async/await
db.query = util.promisify(db.query);


 //to calculate the new price for the promotion
const itemsWithFinalPrices= (items, promotions) => {
  const now = new Date(); // Current date

  // Helper function to calculate final price for a single item
  const calculateFinalPrice = (itemPrice, promotion) => {
    const startDate = new Date(promotion.StartDate);
    const endDate = new Date(promotion.EndDate);
    const isPromotionValid = startDate <= now && endDate >= now;

    return isPromotionValid
      ? (itemPrice - (itemPrice * (promotion.DiscountPercentage || 0) / 100)).toFixed(2)
      : itemPrice.toFixed(2); // Ensure price is formatted to 2 decimal places
  };

  // Map items to include final price based on valid promotions
  return items.map(item => {
    // Find the corresponding promotion for the item
    const promotion = promotions.find(p => p.PromotionID === item.promotionID) || {};

    // Calculate final price
    const finalPrice = calculateFinalPrice(item.Price, promotion);
    console.log("final price: "+finalPrice);
    return {
      ...item,
      FinalPrice: finalPrice
    };
  
  });
};

 //to update  the new price for the promotion in database
const updateFinalPrices = async (itemsWithFinalPrices) => {
  try {
    for (let item of itemsWithFinalPrices) {
      await db.query(
        'UPDATE item SET FinalPrice = ? WHERE ItemID = ?',
        [item.FinalPrice, item.ItemID]
      );
    }
    console.log("Final prices updated successfully");
  } catch (err) {
    console.error("Error updating final prices:", err);
  }
};






const itemViewControl = async (req, res) => {
  try {
    const Promotion=await getPromotionData();
    const stores=await getStoreData();
    const itemsdata = await getItemData();
//================================================================

const newitemwithfinalprice=itemsWithFinalPrices(itemsdata, Promotion);

await updateFinalPrices(newitemwithfinalprice);

 
    //================================================================
    const data = { title: "item/dashboard", items: newitemwithfinalprice,stores:stores,promotions:Promotion };
 
   
    res.render('home', { data });
  } catch (err) {
    console.error("Error fetching item data:", err);
    res.status(500).send('Server error');
  }
};


const editItem = async (req, res) => {
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
      return res.redirect('/items');
    }

    // Get the specific item
    const item = itemResults[0];

    // Get the selected store and promotion IDs
    const selectedStoreID = item.StoreID;
    const selectedPromotionID = item.PromotionID;

    // Prepare data for rendering the edit form
    const data = {
        title: 'item/edit',
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









  

// Function to handle updating an item
const updateItem =async (req, res) => {
 
    const itemId = req.params.id;
    const { 
      ItemName, 
      ItemUnit, 
      Barcode, 
      ExpiryDate, 
      ProductionDate, 
      Price, 
      State, 
      Category, 
      CountryOfOrigin, 
      PromotionID, 
      StoreID ,quantity
    } = req.body;
  
    // Check for required fields
    if (!ItemName || !ItemUnit || !Barcode || !Price || !quantity) {
      const data = {
        title: 'item/edit',
        msg: "Please fill in all required fields",
        style: "danger",
        item: req.body
      };
      return res.render('home', { data });
    }
  
    // SQL query to update item
    const sql = `
      UPDATE item 
      SET 
        ItemName = ?, 
        ItemUnit = ?, 
        Barcode = ?, 
        ExpiryDate = ?, 
        ProductionDate = ?, 
        Price = ?, 
        State = ?, 
        Category = ?, 
        CountryOfOrigin = ?, 
        promotionID = ?, 
        StoreID = ? ,
        quantity=?
      WHERE ItemID = ?
    `;
  
    db.query(sql, [ 
      ItemName, 
      ItemUnit, 
      Barcode, 
      ExpiryDate, 
      ProductionDate, 
      Price, 
      State, 
      Category, 
      CountryOfOrigin, 
      PromotionID, 
      StoreID, 
      quantity,
      itemId 
    ], (err) => {
      if (err) {
        console.error("Error updating item data:", err);
        return res.redirect(`/edititem/${itemId}?msg=Item%20not%20updated%20&style=danger`);

      }
  
     
  



return res.redirect(`/items`);





    });
  };
  


//================================================================



// Define your categories
const categoriesArray = [
    "Dairy",
    "Bakery",
    "Meat",
    "Produce",
    "Canned Goods",
    "Frozen Foods",
    "Vegetables",
    "Fruits",
    "Beverages",
    "Snacks",
    "Condiments",
    "Seafood",
    "Grains",
    "Pasta",
    "Sauces",
    "Oils",
    "Spices",
    "Breakfast Foods",
    "Health Foods"
  ];
  
  const unitsArray = [
    "Kilogram (kg)",
    "Gram (g)",
    "Milligram (mg)",
    "Liter (l)",
    "Milliliter (ml)",
    "Piece",
    "Pack",
    "Box",
    "Dozen",
    "Meter (m)",
    "Centimeter (cm)",
    "Inch"
  ];
  

  const itemStatesArray = [
    "Damaged", // Damaged goods
     // Spoiled
    "In Store", // Available in the store/warehouse
    "On Shelf", // Placed on the shelf
    "Out of Stock", // Temporarily unavailable
    "Expired", // Expired goods
    "In Transit", // Being transported
    "In Inspection", // Under quality control
    "Reserved", // Reserved for customer
    "Returned", // Returned by customer
    "Awaiting Restock" // Waiting for restock
  ];


// Function to fetch country data
const fetchCountries = async () => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    return data.map(country => country.name.common);
  } catch (error) {
    console.error('Error fetching country data:', error);
    return [];
  }
};

// Server-side function to render the page
const addItemPage = async (req, res) => {
  try {
   
    const stores=await getStoreData();
const Promotion=await getPromotionData();
    const countries = await fetchCountries();
    const data = { title: 'item/add', countries, categories: categoriesArray,units:unitsArray,states:itemStatesArray,stores: stores,Promotion};
    return res.render('home', { data });
  } catch (error) {
    console.error('Error rendering page:', error);
    return res.status(500).send('Internal Server Error');
  }
};



  //================================================================
// Function to handle adding a new item

const addItem = async (req, res) => {
    const countries = await fetchCountries();
    const stores=await getStoreData();
const Promotion=await getPromotionData();
    const { ItemName, ItemUnit, Barcode, ExpiryDate, ProductionDate, Price, State, Category, CountryOfOrigin, StoreID, PromotionID,quantity } = req.body;
  
    // Validate required fields
    if (!ItemName || !ItemUnit || !Barcode || !Price || !State || !Category || !StoreID || !quantity) {


      const data = { title: 'item/add',
         countries, categories: categoriesArray,units:unitsArray,states:itemStatesArray,stores: stores,Promotion,msg:"All required fields are required." , style:"danger"};
      return res.render('home', { data });
    }
  //=======================================
  
  const storeid = res.locals.user.storeID;
  const sqlCheck = `SELECT * FROM item WHERE Barcode = ? AND StoreID = ?`;
      const itemResults = await new Promise((resolve, reject) => {
          db.query(sqlCheck, [Barcode, storeid], (err, results) => {
              if (err) return reject(err);
              resolve(results);
          });
      });

      if (itemResults.length === 0) {
        const sqlInsert = `
            INSERT INTO item (
                ItemName, ItemUnit, Barcode, ExpiryDate, ProductionDate, 
                Price, State, Category, CountryOfOrigin, StoreID, PromotionID, quantity
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        await new Promise((resolve, reject) => {
            db.query(sqlInsert, [ItemName, ItemUnit, Barcode, ExpiryDate, ProductionDate, Price, State, Category, CountryOfOrigin, StoreID, PromotionID, quantity], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const data = { title: 'item/add',
          countries, categories: categoriesArray,units:unitsArray,states:itemStatesArray,stores: stores,Promotion,msg:"Item hass been Added Successfully to This Store NO:"+storeid , style:"success"};
       return res.render('home', { data });
    } else {
        // If item already exists, update its quantity
        const sqlUpdate = "UPDATE item SET quantity = quantity + ? WHERE Barcode = ? AND StoreID = ?";
        await new Promise((resolve, reject) => {
            db.query(sqlUpdate, [quantity, Barcode, storeid], (err) => {
                if (err) return reject(err);
                resolve();
            });
        });

        const data = { title: 'item/add',
          countries, categories: categoriesArray,units:unitsArray,states:itemStatesArray,stores: stores,Promotion,msg:"Quanitity For this Item has been Updeted in The Store "+storeid , style:"success"};
       return res.render('home', { data });
    }

  };

// Function to render the page for deleting an item


//============================================================================
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
        return res.redirect('/items');
      }
  
      // Get the specific item
      const item = itemResults[0];
  
      // Get the selected store and promotion IDs
      const selectedStoreID = item.StoreID;
      const selectedPromotionID = item.PromotionID;
  
      // Prepare data for rendering the edit form
      const data = {
          title: 'item/delete',
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
const deleteItem = (req, res) => {
  const itemId = req.params.id;

  if (!itemId) {
    //  console.log("Item not found: " + itemId);
   return res.redirect("/items");
 
  }

  const sql = 'DELETE FROM item WHERE ItemID = ?';
  db.query(sql, [itemId], (err, result) => {
    if (err) {
      console.error("Error deleting item: " + err);
      console.log("Item not found: " + itemId);
      return res.redirect("/items");
    }
    if (result.affectedRows === 0) {
    

      console.log("'No item found with the given ID'" + itemId);
      return res.redirect("/items");
    }
   
    console.log("Item has benn successfully deleted" + itemId);
    return res.redirect("/items");
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
        return res.redirect("/items");
    }
    const data = {
      title: 'item/view',promotions:  promotions,stores: stores, 
      item: itemResults[0]
    };
    res.render('home', { data });
  } catch (err) {
    console.error("Database error: " + err);
    return res.redirect("/items");
  }
};

// Function to search for items

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
        WHERE ItemID = ? 
        OR ItemName LIKE ?
        OR Barcode = ?
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
          title: 'item/dashboard',
          items: [],
          stores: stores,
          promotions: promotions,
          msg: 'No items found'
        };
        return res.render('home', { data });
      }
  
      // Prepare data for rendering
      const data = {
        title: 'item/dashboard',
        items: itemResults,
        stores: stores,
        promotions: promotions
      };
      return res.render('home', { data });
  
    } catch (err) {
      console.error("Error in item search: " + err);
      const data = {
        title: 'item/dashboard',
        items: [],
        stores: [],
        promotions: [],
        msg: "Error retrieving item data"
      };
      res.render('home', { data });
    }
  };
  
// Export all handlers
module.exports = {
    deleteItem,
  deleteItemPage,
  searchItemController,
  itemViewControl,
  editItem,
  updateItem,
  addItemPage,
  addItem,

  itemViewDetails
};
