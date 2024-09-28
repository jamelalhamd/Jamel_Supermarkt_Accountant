const { db,getPromotionData ,getStoreData,fetchIteminvoice,getUser,getInvoiceById,getInvoiceItemsById,getInvoice} = require('../controller/db');

const salesinvocepage=async(req, res) => { 
  const sqlvoices = `SELECT * FROM salesinvoice`;
  const invoices = await new Promise((resolve, reject) => {
      db.query(sqlvoices, (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
  

       
        const data = {
          title: "sales/salesinvoice",
   
          style: 'danger',
          items: invoices,
        
      };
      return res.render('home', { data });
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


 //================================================================
 
 //================================================================
 
 //================================================================
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
  
      const storeid=res.locals.user.storeID;
      const sql = `
        SELECT * FROM item 
        WHERE Barcode = ? AND StoreID =?
      `;
    
      // Fetch item by barcode
      const itemResults = await new Promise((resolve, reject) => {
        db.query(sql, [searchTerm,storeid], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
      // Handle case where no item was found
      if (itemResults.length === 0) {
        const data = {
          title: "sales/addinvoice",
          msg: `No items found for the search term in this Store  "${searchTerm}".`,
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
    if (foundItem.quantity>=quantity &&quantity>0 ) {
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

      await updatequanity(itemid,quantity);

        const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ? `;
  
        const invoiceItems = await new Promise((resolve, reject) => {
          db.query(sqlFetchItems, [invoiceid], (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });
    //================================================================
    let totalPrice = 0;
    invoiceItems.forEach(item => {
      totalPrice += item.total; // Assuming 'total' is the field in the database for each item’s total price
    });
    
    console.log("Final Total Price:", totalPrice);


    //===================================================
        // Success: Render the updated list of items with a success message
        const data = {
          totalPrice:totalPrice,
          title: "sales/addinvoice",
          msg: `Item "${foundItem.ItemName}" (ID: ${foundItem.ItemID}) successfully added to invoice.`,
          style: 'success',
          items: invoiceItems, // Updated list of items
          salesinvoiceID: invoiceid
        };
        return res.render('home', { data });
    }
    else{

      const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ? `;
  
      const invoiceItems = await new Promise((resolve, reject) => {
        db.query(sqlFetchItems, [invoiceid], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });

         console.log("(foundItem.quantity>quantity &&quantity>0 )"+(foundItem.quantity>quantity &&quantity>0 ));
      const data = {
        title: "sales/addinvoice",
        msg: `there is no enough Item in this Store. only { `+foundItem.quantity +" }in the Store",
        style: 'success',
        items: invoiceItems, // Updated list of items
        salesinvoiceID: invoiceid
      };
      return res.render('home', { data });

    }
  //================================================================



  //================================================================
      // Fetch updated items for the sales invoice, join with item table to get more info
    
  
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
  
  

 //================================================================
 
 //================================================================
 
 //================================================================








  const updateSalesInvoiceItem = async (req, res) => {
    const { quantity, invoiceid, salesinvoiceitemID, price } = req.body; 
    const total = quantity * price;

    const invoiceItems = await fetchInvoiceItems(invoiceid);
    const itemid=invoiceItems[0].itemid ;

const altequanittiy=invoiceItems[0].Quantity;
const  updatedquanity=altequanittiy-quantity;
 const deltaqunitity=quantity-altequanittiy;//to calculte the new quanitity to update qunitity in store
//==============================

console.log("newquanitity"+quantity);
console.log("altquanitity"+altequanittiy);
console.log("itemid"+invoiceItems[0].itemid);

console.log("deltaqunitity"+deltaqunitity);

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
//================================================================


    await updatequanity(itemid,deltaqunitity);


//===========================================================

let totalPrice = 0;
invoiceItems.forEach(item => {
  totalPrice += item.total; // Assuming 'total' is the field in the database for each item’s total price
});

console.log("Final Total Price:", totalPrice);

//=====================================
        const data = {
          totalPrice:totalPrice,
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
  const { invoiceid, salesinvoiceitemID, itemid, quantity } = req.body;

  console.log("itemid: " + itemid);
  console.log("quantity: " + quantity);
  console.log("Deleting item with invoiceid: " + invoiceid + " and salesinvoiceitemID: " + salesinvoiceitemID);
  console.log("req.body: " + JSON.stringify(req.body));

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

      // Fetch the updated list of items after successful deletion
      const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?`;
      const invoiceItems = await new Promise((resolve, reject) => {
          db.query(sqlFetchItems, [invoiceid], (err, results) => {
              if (err) return reject(err);
              resolve(results);
          });
      });

      //================================================================
      let totalPrice = 0;
      invoiceItems.forEach(item => {
        totalPrice += item.total; // Assuming 'total' is the field in the database for each item’s total price
      });
      await updatequanity(itemid,-quantity);
      //================================================================

      const data = {
        totalPrice:totalPrice,
        title: "sales/addinvoice",
        msg: "Item deleted Successfully", 
        style: 'success',
        items: invoiceItems,
        salesinvoiceID: invoiceid
    };
    return res.render('home', { data });
  });
};







const updatequanity=async(itemid,quantity)=>{

  const sqlOriginalItem = `SELECT * FROM item WHERE ItemID = ?`;
  const originalItemResult = await new Promise((resolve, reject) => {
      db.query(sqlOriginalItem, [itemid], (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });

  if (originalItemResult.length === 0) {
      console.error("No original item found.");
      return res.status(500).send("Original item not found.");
  }

  // Extract current quantity from the original item
  const originalItem = originalItemResult[0]; // First result
  const currentQuantity = originalItem.quantity; // Assuming the column name is 'Quantity'

  // Calculate the new quantity after deletion
  const newQuantity = currentQuantity - parseInt(quantity, 10); // Convert quantity to an integer if necessary

  // Update the item with the new quantity
  const sqlUpdateItem = `UPDATE item SET quantity = ? WHERE ItemID = ?`;
  db.query(sqlUpdateItem, [newQuantity, itemid], (err, result) => {
      if (err) {
        console.log(object)
          console.error("Error updating item quantity:", err);
          const data = {
            title: "sales/addinvoice",
            msg: "Error updating item quantity:", err,
            style: 'danger',
            items: invoiceItems,
            salesinvoiceID: invoiceid
        };
        return res.render('home', { data });
      }

      // Render the updated page with success message
     
  });



}


const createthevoicecontroller = async (req, res) => {
  const { NameClient, totalprice, employee_id, invoiceid } = req.body;

  console.log(req.body);

  // SQL query to update the salesinvoice
  const sqlUpdateInvoice = `
    UPDATE salesinvoice 
    SET salesinvoiceDate = ?, 
        totalprice = ?, 
        employee_id = ?, 
        NameClient = ? 
    WHERE salesinvoiceID = ?
  `;

//================================================================

const sqlvoices = `SELECT * FROM salesinvoice`;
const invoices = await new Promise((resolve, reject) => {
    db.query(sqlvoices, [invoiceid], (err, results) => {
        if (err) return reject(err);
        resolve(results);
    });
});

const data=new Date();

//==============================================
  db.query(sqlUpdateInvoice, [data, totalprice, employee_id, NameClient, invoiceid], async (err, result) => {
    if (err) {
     
      const data = {
        title: "sales/salesinvoice",
        msg: "Failed to update the invoice."+err,
        style: 'danger',
        items: invoices,
      
    };
    return res.render('home', { data });


    }

    // If update is successful, fetch all invoices
    const sqlvoicesafter = `SELECT * FROM salesinvoice`;
    const invoicesafter = await new Promise((resolve, reject) => {
        db.query(sqlvoicesafter, [invoiceid], (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });

    const data = {
      title: "sales/salesinvoice",
      msg: "inoice has been updated successfully",
      style: 'success',
      items: invoicesafter ,
    
  };
  return res.render('home', { data });

  });
};


const viewinvoicepagecontroller = async (req, res) => {


  const id = req.params.id;
 
console.log("id: " + id);

  try {
    // Query for the sales invoice
    const sqlInvoice = `SELECT * FROM salesinvoice WHERE salesinvoiceID = ?`;
    const invoicedata = await new Promise((resolve, reject) => {
      db.query(sqlInvoice, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results[0]); // Assuming only one invoice is returned
      });
    });
   console.log( sqlInvoice);
    // Query for the related items in the sales invoice
    const sqlInvoiceItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?`;
    const invoiceitemdata = await new Promise((resolve, reject) => {
      db.query(sqlInvoiceItems, [id], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });
    console.log( sqlInvoice);
    // Calculate the total price of the invoice items
    let totalPrice = 0;
    invoiceitemdata.forEach(item => {
      totalPrice += item.total || 0; // Ensure the 'total' exists and is not null
    });

    // Prepare data for the view
    const data = {
      totalPrice: totalPrice,
      title: "sales/invoiceview",
      style: 'success',
      items: invoiceitemdata,
      salesinvoiceID: id,
      invoice: invoicedata, // Pass invoice data if needed in the template
    };
 
    console.log("invoice.data: " + data.invoice.NameClient);
    // Render the view with the invoice data
    return res.render('home', { data });

  } catch (error) {
    console.error("Error fetching invoice data: ", error);
    const data = {
   
      title: "404",
     // Pass invoice data if needed in the template
    };

    // Render the view with the invoice data
    return res.render('home', { data });
  }
};




  const editinvoicepage=async(req, res) => { 
    const id = req.params.id;
    const employee_id = res.locals.user.employee_id; // Employee ID from session
    const invoice=await getInvoiceById(id);
    const items=await getInvoiceItemsById(id);
  
      const data = {
        title: "sales/invoiceedite",
        msg: "Sales invoice created successfully.",
        style: 'success',
        invoice: invoice,
        items:items // Correctly access the insertId from the result
      };
 
      return res.render('home', { data });
    
   }
 ;



  const deleteinvoicecontroller=async(req, res) => {
    const id = req.params.id;
   
    try {
    const invoices=await  getInvoiceById(id);

    const invoiceitem=await  getInvoiceItemsById(id);


    let totalPrice = 0;
    invoiceitem.forEach(item => {
      totalPrice += item.total || 0; // Ensure the 'total' exists and is not null
    });



   
        

    const data = {
      totalPrice: totalPrice,
      title: "sales/invoicedelete",
      style: 'success',
      items: invoiceitem,
      salesinvoiceID: id,
      invoice: invoices, // Pass invoice data if needed in the template
    };
 
  
    
    return res.render('home', { data });


  
    } catch (error) {
      console.error("Error fetching invoice data: ", error);
      const data = {
     
        title: "404",
       // Pass invoice data if needed in the template
      };
  
      // Render the view with the invoice data
      return res.render('home', { data });
    }} ;



    const deleteinvoice = async (req, res) => {
      const id = req.params.id;
      console.log(id);
    
      try {
        // Fetch the invoice items first before deleting
        const invoiceitems = await getInvoiceItemsById(id);
        console.log("Invoice Items:", JSON.stringify(invoiceitems, null, 2));
    
        // Update quantities for each item before deletion

       
        await Promise.all(invoiceitems.map(item =>    updatequanity(item.itemid, item.Quantity *(-1))));
    
        // Check if the invoice exists
      
    
        // Delete invoice items
        const sqlDeleteItems = "DELETE FROM salesinvoiceitem WHERE salesinvoiceID = ?";
        await new Promise((resolve, reject) => {
          db.query(sqlDeleteItems, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    
        // Delete the invoice
        const sqlDeleteInvoice = "DELETE FROM salesinvoice WHERE salesinvoiceID = ?";
        await new Promise((resolve, reject) => {
          db.query(sqlDeleteInvoice, [id], (err, result) => {
            if (err) return reject(err);
            resolve(result);
          });
        });
    
        // Fetch updated invoices
        const sqlvoices = `SELECT * FROM salesinvoice`;
        const invoices = await new Promise((resolve, reject) => {
          db.query(sqlvoices, (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });
    
       
        const data = {
          title: "sales/salesinvoice",
          msg: "Invoice has been deleted successfully",
          style: 'success',
          items: invoices,
        };
    
        return res.render('home', { data });
    
      } catch (error) {
        console.log(error);
        return res.status(500).send("Server Error");
      }
    };
    
    
    
const editedite=async(req, res) => {updateitemainvoice(req, res, "sales/invoiceedite");}

const addedite = async (req, res) => {
  additem(req, res, "sales/invoiceedite");
};


const deleteedite=async(req, res) => {deleteitem(req, res, "sales/invoiceedite");}




module.exports = {salesinvocepage,deleteinvoice,addedite,editedite,deleteedite,
  addsalesinvocepage,
  searchItemController,editinvoicepage,
  updateSalesInvoiceItem,deleteinvoicecontroller,
  deleteSalesInvoiceItem,
  createthevoicecontroller,
  viewinvoicepagecontroller,

}




const updateitemainvoice = async (req, res, title = "sales/addinvoice") => {
  const { quantity, invoiceid, salesinvoiceitemID, price } = req.body;
  const total = quantity * price;

  try {
      // Fetch invoice items for the given invoice ID
      const invoiceItems = await fetchInvoiceItems(invoiceid);
      if (!invoiceItems.length) {
          console.log("No invoice items found.");
          return res.render('home', {
              data: {
                  title,
                  msg: "No invoice items found.",
                  style: 'warning',
                  items: [],
                  salesinvoiceID: invoiceid
              }
          });
      }

      const itemid = invoiceItems[0].itemid;
      const altequanittiy = invoiceItems[0].Quantity;
      const updatedquanity = altequanittiy - quantity;
      const deltaqunitity = quantity - altequanittiy; // Calculate the delta quantity

      console.log("New quantity: " + quantity);
      console.log("Old quantity: " + altequanittiy);
      console.log("Item ID: " + itemid);
      console.log("Delta quantity: " + deltaqunitity);

      // SQL query to update the sales invoice item
      const sqlUpdate = `UPDATE salesinvoiceitem SET Quantity = ?, Total = ? WHERE salesinvoiceitemID = ?`;
      console.log(`Executing SQL: ${sqlUpdate}`);

      // Perform the update
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
          const updatedItems = await fetchInvoiceItems(invoiceid); // Fetch updated items after no change
          return res.render('home', {
              data: {
                  title,
                  msg: "No item was updated.",
                  style: 'warning',
                  items: updatedItems,
                  salesinvoiceID: invoiceid
              }
          });
      }

      // Fetch updated items after the successful update
      const updatedInvoiceItems = await fetchInvoiceItems(invoiceid);

      // Update the item quantity in the store
      await updatequanity(itemid, deltaqunitity);

      // Calculate the total price of all invoice items
      let totalPrice = 0;
      updatedInvoiceItems.forEach(item => {
          totalPrice += item.total; // Assuming 'total' is a field in the database for each item's total price
      });

      console.log("Final Total Price:", totalPrice);

      // Render the response with success message
      return res.render('home', {
          data: {
              totalPrice,
              title,
              msg: "Quantity has been updated successfully.",
              style: 'success',
              items: updatedInvoiceItems,
              salesinvoiceID: invoiceid
          }
      });

  } catch (err) {
      console.error("An error occurred:", err);
      // Render the response with an error message
      return res.render('home', {
          data: {
              title,
              msg: "An error occurred while updating the item.",
              style: 'danger',
              items: [], // You can refetch items if needed
              salesinvoiceID: invoiceid
          }
      });
  }
};


const additem = async (req, res, title = "sales/salesinvoice") => {
  const id = req.params.id; // Invoice ID from URL parameters
  const { invoiceid, search, quantity } = req.body;
  const employee_id = res.locals.user.employee_id; // Employee ID from session

  try {
    // Fetch invoice and invoice items
    const invoice = await getInvoiceById(id);
    const items = await getInvoiceItemsById(id);
    const searchTerm = search ? search.trim() : '';

    // Log fetched data
    console.log("Invoice:", JSON.stringify(invoice, null, 2));
    console.log("Invoice Items Before Add:", JSON.stringify(items, null, 2));

    // Validate required fields
    if (!searchTerm || !quantity || isNaN(quantity) || quantity <= 0) {
      const data = {
        title,
        msg: "Please fill in all required fields.",
        style: 'danger',
        invoice,
        items
      };
      return res.render('home', { data });
    }

    // Fetch item by barcode and store
    const storeid = res.locals.user.storeID;
    const sql = `SELECT * FROM item WHERE Barcode = ? AND StoreID = ?`;
    const itemResults = await new Promise((resolve, reject) => {
      db.query(sql, [searchTerm, storeid], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    if (itemResults.length === 0) {
      const data = {
        title,
        msg: "No item found in this store.",
        style: 'danger',
        invoice,
        items
      };
      return res.render('home', { data });
    }

    // Handle item addition
    const foundItem = itemResults[0];
    const parsedQuantity = parseInt(quantity, 10);
    const total = parsedQuantity * foundItem.Price;

    if (foundItem.quantity >= quantity && quantity > 0) {
      // Insert the item into salesinvoiceitem
      const sqlAdd = `
        INSERT INTO salesinvoiceitem (Quantity, price, total, salesinvoiceID, itemid, item_name, baracode)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      await new Promise((resolve, reject) => {
        db.query(sqlAdd, [parsedQuantity, foundItem.Price, total, id, foundItem.ItemID, foundItem.ItemName, foundItem.Barcode], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      // Update item quantity and fetch updated invoice items
      await updatequanity(foundItem.ItemID, parsedQuantity);
      const updatedItems = await getInvoiceItemsById(id);

      // Calculate total price after item addition
      let totalPrice = updatedItems.reduce((acc, item) => acc + item.total, 0);
      console.log("Final Total Price:", totalPrice);

      // Update salesinvoice with current employee and timestamp
      const sqlUpdate = `UPDATE salesinvoice SET employee_id = ?, salesinvoiceDate = ? WHERE salesinvoiceID = ?`;
      const currentDate = new Date();
      db.query(sqlUpdate, [employee_id, currentDate, id], (err, result) => {
        if (err) {
          console.error("Error updating salesinvoice:", err);
          return;
        }
        console.log("Invoice updated successfully:", result);
      });

      // Render the updated invoice view with success message
      const data = {
        title,
        totalPrice,
        msg: `Item "${foundItem.ItemName}" successfully added to the invoice.`,
        style: 'success',
        invoice: await getInvoiceById(id),
        items: updatedItems
      };
      return res.render('home', { data });

    } else {
      // Handle case when there's insufficient stock
      const data = {
        title,
        msg: `Insufficient stock. Only ${foundItem.quantity} available.`,
        style: 'danger',
        invoice,
        items
      };
      return res.render('home', { data });
    }

  } catch (err) {
    // Catch and log errors
    console.error("Error adding item:", err);
    const data = {
      title,
      msg: "An error occurred while adding the item.",
      style: 'danger',
      invoice: await getInvoiceById(id), // Ensure invoice is still fetched on error
      items: await getInvoiceItemsById(id) // Fetch current invoice items even on error
    };
    return res.render('home', { data });
  }
};



const deleteitem= async (req, res,title="sales/salesinvoice") => {
  const { invoiceid, salesinvoiceitemID, itemid, quantity } = req.body;

  console.log("itemid: " + itemid);
  console.log("quantity: " + quantity);
  console.log("Deleting item with invoiceid: " + invoiceid + " and salesinvoiceitemID: " + salesinvoiceitemID);
  console.log("req.body: " + JSON.stringify(req.body));

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
              title,
              msg: "No item found to delete.",
              style: 'warning',
              items: invoiceItems,
              salesinvoiceID: invoiceid
          };
          return res.render('home', { data });
      }

      // Fetch the updated list of items after successful deletion
      const sqlFetchItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?`;
      const invoiceItems = await new Promise((resolve, reject) => {
          db.query(sqlFetchItems, [invoiceid], (err, results) => {
              if (err) return reject(err);
              resolve(results);
          });
      });

      //================================================================
      let totalPrice = 0;
      invoiceItems.forEach(item => {
        totalPrice += item.total; // Assuming 'total' is the field in the database for each item’s total price
      });
      await updatequanity(itemid,-quantity);
      //================================================================

      const data = {
        totalPrice:totalPrice,
        title,
        msg: "Item deleted Successfully", 
        style: 'success',
        items: invoiceItems,
        salesinvoiceID: invoiceid
    };
    return res.render('home', { data });
  });
};