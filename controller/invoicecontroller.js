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

    const { quantity, invoiceid ,salesinvoiceitemID} = req.body; 
    console.log("invoiceid"+invoiceid);

    const sql = `UPDATE salesinvoiceitem SET Quantity = ? WHERE salesinvoiceitemID = ?`;
    console.log(sql);
    db.query(sql, [quantity, salesinvoiceitemID], async (err, result) => {
        if (err) {
            console.error("Error updating sales invoice item:", err);
//================================================================
const sqlFetchItemsbeforadd = `  SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?  `;
  
const invoiceItemsbeforadd = await new Promise((resolve, reject) => {
  db.query(sqlFetchItemsbeforadd, [invoiceid], (err, results) => {
    if (err) return reject(err);
    resolve(results);
  });
});

console.log("invoiceItemsbeforadd"+invoiceItemsbeforadd);
const data = {
    title: "sales/addinvoice",
    msg: "Please enter valid search details (barcode and quantity).",
    style: 'warning',
    items: invoiceItemsbeforadd,
    salesinvoiceID: invoiceid
  };
  return res.render('home', { data });
}


//================================================================
        

        if (result.affectedRows === 0) {

            
console.log("invoiceItemsbeforadd ==00"+invoiceItemsbeforadd);
            const data = {
                title: "sales/addinvoice",
                msg:" No item to edited",
                style: 'warning',
                items: invoiceItemsbeforadd,
                salesinvoiceID: invoiceid
              };
              return res.render('home', { data });
        }

       

        //=======

     
        const sqlFetchItems = `  SELECT * FROM salesinvoiceitem WHERE salesinvoiceID = ?  `;
  
        const invoiceItemsbeforadd = await new Promise((resolve, reject) => {
          db.query(sqlFetchItems, [invoiceid], (err, results) => {
            if (err) return reject(err);
            resolve(results);
          });
        });


        console.log("invoiceItemsbeforadd sucessced "+invoiceItemsbeforadd);
        const data = {
            title: "sales/addinvoice",
            msg:" Quantity has been edited",
            style: 'success',
            items: invoiceItemsbeforadd,
            salesinvoiceID: invoiceid
          };
          return res.render('home', { data });

        
        
    });
};



  





module.exports = {salesinvocepage,addsalesinvocepage,searchItemController,updateSalesInvoiceItem}