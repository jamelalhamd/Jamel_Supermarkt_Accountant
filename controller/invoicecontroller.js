const { db,getPromotionData ,getStoreData,fetchIteminvoice} = require('../controller/db');

const salesinvocepage=(req, res) => { 
 console.log("invoceitem");
    const data = { title: "sales/salesinvoice",}

res.render('home', { data });
}


const addsalesinvocepage=(req, res) => { 
    const salesinvoiceDate = new Date(); // Get the current date and time
    const totalprice = 0; // Initial total price
    const employee_id = res.locals.user.employee_id; // Employee ID from session
    const NameClient = req.body.NameClient || ""; // Get the client name from the request body
  
    // Prepare SQL query for inserting a new sales invoice
    const sql = `
      INSERT INTO salesinvoice (salesinvoiceDate, totalprice, employee_id, NameClient)
      VALUES (?, ?, ?, ?)
    `;
    console.log(sql);
    
    // Execute the SQL query with the provided data
    db.query(sql, [salesinvoiceDate, totalprice, employee_id, NameClient], (err, result) => {
      if (err) {
        // Handle error case
        console.error('Error inserting new sales invoice:', err);
  
        const data = {
          title: "sales/addinvoice",
          msg: "Error creating the sales invoice.",
          style: 'danger'
        };
        return res.render('home', { data });
      }
  
      console.log("result:", result);
  
      // Success: Render the success page
      const data = {
        title: "sales/addinvoice",
        msg: "Sales invoice created successfully.",
        style: 'success',
        salesinvoiceID: result.insertId // Correctly access the insertId from the result
      };
    console.log("result.insertId"+result.insertId);
      return res.render('home', { data });
    });
   }


 
   const searchItemController = async (req, res) => {
    try {
      // Extract form data
      const { invoiceid, search, quantity } = req.body;
      const searchTerm = search ? search.trim() : '';
      const employeeID = req.body.employee_id || res.locals.user.employee_id;
  //=====================
  const sqlFetchItemsbeforadd = `  SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?  `;
  
  const invoiceItemsbeforadd = await new Promise((resolve, reject) => {
    db.query(sqlFetchItemsbeforadd, [invoiceid], (err, results) => {
      if (err) return reject(err);
      resolve(results);
    });
  });

  //======================
      // Validate required fields
      if (!invoiceid || !searchTerm || !quantity || isNaN(quantity) || quantity <= 0) {
        const data = {
          title: "sales/addinvoice",
          msg: "Please enter valid search details (barcode and quantity).",
          style: 'warning',
          items: invoiceItemsbeforadd,
          salesinvoiceID: invoiceid
          
        };
        return res.render('home', { data });
      }
  
      // SQL query to search for the item by barcode
      const sql = `
        SELECT * FROM item 
        WHERE Barcode = ?
      `;
  
      // Fetch item by barcode
      const itemResults = await new Promise((resolve, reject) => {
        db.query(sql, [searchTerm], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      // Handle case where no item was found
      if (itemResults.length === 0) {
        const data = {
          title: "sales/addinvoice",
          msg: `No items found for the search term: "${searchTerm}".`,
          style: 'danger',
          items: invoiceItemsbeforadd,
          salesinvoiceID: invoiceid
        };
        return res.render('home', { data });
      }
  
      // Extract the first found item
      const foundItem = itemResults[0];
      const parsedQuantity = parseInt(quantity, 10);
      const price = foundItem.Price;
      const total = parsedQuantity * price;
      const itemid = foundItem.ItemID;
  
      // SQL to insert the item into the invoice
      const sqlAdd = `
        INSERT INTO SalesInvoiceItem (Quantity, price, total, salesinvoiceID, itemid,item_name,baracode)
        VALUES (?, ?, ?, ?, ?,?,?)
      `;
  
      // Insert item into SalesInvoiceItem table
      await new Promise((resolve, reject) => {
        db.query(sqlAdd, [parsedQuantity, price, total, invoiceid, itemid,foundItem.ItemName,foundItem.Barcode], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });
  
      // Fetch updated items for the sales invoice, join with item table to get more info
      const sqlFetchItems = `  SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?  `;
  
      const invoiceItems = await new Promise((resolve, reject) => {
        db.query(sqlFetchItems, [invoiceid], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      // Success: Render the updated list of items with a success message
      const data = {
        title: "sales/addinvoice",
        msg: `Item "${foundItem.ItemName}" (ID: ${foundItem.ItemID}) successfully added to invoice.`,
        style: 'success',
        items: invoiceItems, // Updated list of items
        salesinvoiceID: invoiceid
      };
      return res.render('home', { data });
  
    } catch (err) {
      console.error("Error in item search:", err);
  
      // Render error message in case of failure
      const data = {
        title: "sales/addinvoice",
        msg: "An error occurred while searching for or adding items.",
        style: 'danger',
        salesinvoiceID: req.body.invoiceid || ''
      };
      return res.render('home', { data });
    }
  };
  
  
  const updateSalesInvoiceItem = async (req, res) => {
    const { quantity, invoiceid, salesinvoiceitemID, price } = req.body; 
    const total = quantity * price;

    const sqlUpdate = `UPDATE salesinvoiceitem SET Quantity = ?, Total = ? WHERE salesinvoiceitemID = ?`;
    console.log(`Executing SQL: ${sqlUpdate}`);

    try {
        // Update sales invoice item
        const result = await new Promise((resolve, reject) => {
            db.query(sqlUpdate, [quantity, total, salesinvoiceitemID], (err, result) => {
                if (err) {
                    console.error("Error updating sales invoice item:", err);
                    return reject(err);
                }
                resolve(result);
            });
        });

        if (result.affectedRows === 0) {
            console.log("No item was updated.");
            const invoiceItems = await fetchInvoiceItems(invoiceid); // Fetch updated items
            const data = {
                title: "sales/addinvoice",
                msg: "No item was updated.",
                style: 'warning',
                items: invoiceItems,
                salesinvoiceID: invoiceid
            };
            return res.render('home', { data });
        }

        // Fetch updated items after the update
        const invoiceItems = await fetchInvoiceItems(invoiceid);

        const data = {
            title: "sales/addinvoice",
            msg: "Quantity has been updated successfully.",
            style: 'success',
            items: invoiceItems,
            salesinvoiceID: invoiceid
        };
        return res.render('home', { data });

    } catch (err) {
        console.error("An error occurred:", err);
        const data = {
            title: "sales/addinvoice",
            msg: "An error occurred while updating the item.",
            style: 'danger',
            items: [], // You can refetch items if needed
            salesinvoiceID: invoiceid
        };
        return res.render('home', { data });
    }
};

// Helper function to fetch updated sales invoice items
const fetchInvoiceItems = async (invoiceid) => {
    const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?`;

    const invoiceItems = await new Promise((resolve, reject) => {
        db.query(sqlFetchItems, [invoiceid], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    return invoiceItems;
};


const deleteSalesInvoiceItem = async (req, res) => {
    const { invoiceid, salesinvoiceitemID } = req.body; 
    console.log("Deleting item with invoiceid: " + invoiceid + " and salesinvoiceitemID: " + salesinvoiceitemID);

    // SQL query to delete the sales invoice item
    const sql = `DELETE FROM salesinvoiceitem WHERE salesinvoiceitemID = ?`;
    
    db.query(sql, [salesinvoiceitemID], async (err, result) => {
        if (err) {
            console.error("Error deleting sales invoice item:", err);
            return res.status(500).send("Error deleting sales invoice item.");
        }

        // If no rows were affected, show a warning message
        if (result.affectedRows === 0) {
            console.log("No item found to delete.");

            // Fetch the updated list of items after the deletion attempt
            const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?`;
            const invoiceItems = await new Promise((resolve, reject) => {
                db.query(sqlFetchItems, [invoiceid], (err, results) => {
                    if (err) return reject(err);
                    resolve(results);
                });
            });

            const data = {
                title: "sales/addinvoice",
                msg: "No item found to delete.",
                style: 'warning',
                items: invoiceItems,
                salesinvoiceID: invoiceid
            };
            return res.render('home', { data });
        }

        // Fetch the updated list of items after the successful deletion
        const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?`;
        const invoiceItems = await new Promise((resolve, reject) => {
            db.query(sqlFetchItems, [invoiceid], (err, results) => {
                if (err) return reject(err);
                resolve(results);
            });
        });

        console.log("Successfully deleted item and fetched updated items.");

        // Render the page with updated data after deletion
        const data = {
            title: "sales/addinvoice",
            msg: "Item successfully deleted.",
            style: 'success',
            items: invoiceItems,
            salesinvoiceID: invoiceid
        };
        return res.render('home', { data });
    });
};


  





module.exports = {salesinvocepage,addsalesinvocepage,searchItemController,updateSalesInvoiceItem,deleteSalesInvoiceItem}