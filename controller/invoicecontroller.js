const { db,getPromotionData,getSupplierData,getEmployees,getpurchesesinvoice ,getBysalesinvoiceitemID ,getStoreData,fetchIteminvoice,getUser,getInvoiceById,getInvoiceItemsById,getInvoice, runQuery} = require('../controller/db');

const salesinvocepage=async(req, res) => { 
  const sqlvoices = `SELECT * FROM salesinvoice`;

  const supplier=await getSupplierData();
  const user = await getEmployees();

  const invoices = await new Promise((resolve, reject) => {
      db.query(sqlvoices, (err, results) => {
          if (err) return reject(err);
          resolve(results);
      });
  });
  

       
        const data = {
          title: "sales/salesinvoice",
          supplier,user,
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

      const items = await getInvoiceItemsById(invoiceid);
 
      console.log("items"+JSON.stringify(items));

      // Early validation for required fields
      if (!invoiceid || !searchTerm || !quantity || isNaN(quantity) || quantity <= 0) {
        let totalprice = items.reduce((sum, item) => sum + item.	total, 0);
          const data = {
              title: "sales/addinvoice",
              msg: "Please enter valid search details (barcode and quantity).",
              style: 'warning',
              totalprice,
              items: items,
              salesinvoiceID: invoiceid,
          };
          return res.render('home', { data });
      }

      const storeid = res.locals.user.storeID;
console.log("storeid "+storeid )
      // Fetch necessary data
    
      
    
      const invoiceItemsBeforeAdd = await getInvoiceItemsById(invoiceid);
console.log("invoiceItemsBeforeAdd ",JSON.stringify(invoiceItemsBeforeAdd ))  ;
    let totalprice = invoiceItemsBeforeAdd.reduce((sum, item) => sum + item.total, 0);

      // SQL to fetch item by barcode
      const sql = `SELECT * FROM item WHERE Barcode = ? AND StoreID = ?`;
      const itemResults = await new Promise((resolve, reject) => {
          db.query(sql, [searchTerm, storeid], (err, results) => {
              if (err) return reject(err);
              resolve(results);
          });
      });

      // Handle case where no item was found
      if (itemResults.length === 0) {
          const data = {
            totalprice,
              title: "sales/addinvoice",
              msg: `No items found for the search term "${searchTerm}" in this Store.`,
              style: 'danger',
              items: invoiceItemsBeforeAdd,
              salesinvoiceID: invoiceid,
          };
          return res.render('home', { data });
      }

      // Extract the first found item
      const foundItem = itemResults[0];
      const parsedQuantity = parseInt(quantity, 10);
      const price = foundItem.Price;
      const total = parsedQuantity * price;

      // Check item availability and add to invoice
      if (foundItem.quantity >= parsedQuantity && parsedQuantity > 0) {
          const sqlAdd = `
              INSERT INTO SalesInvoiceItem (Quantity, price, total, salesinvoiceID, itemid, item_name, baracode)
              VALUES (?, ?, ?, ?, ?, ?, ?)
          `;
          await new Promise((resolve, reject) => {
              db.query(sqlAdd, [parsedQuantity, price, total, invoiceid, foundItem.ItemID, foundItem.ItemName, foundItem.Barcode], (err, result) => {
                  if (err) return reject(err);
                  resolve(result);
              });
          });

          await updatequanity(foundItem.ItemID, parsedQuantity);

          const invoiceItemsAfter = await getInvoiceItemsById(invoiceid);
          totalprice = invoiceItemsAfter.reduce((sum, item) => sum + item.total, 0);

          // Success: Render the updated list of items
          const data = {
              totalprice,
              title: "sales/addinvoice",
              msg: `Item "${foundItem.ItemName}" (ID: ${foundItem.ItemID}) successfully added to invoice.`,
              style: 'success',
              items: invoiceItemsAfter,
              salesinvoiceID: invoiceid,
          };
          return res.render('home', { data });
      } else {
          const invoiceItems = await getInvoiceItemsById(invoiceid);
          totalprice = invoiceItems.reduce((sum, item) => sum + item.total, 0);

          const data = {
              title: "sales/addinvoice",
              msg: `Insufficient stock. Only ${foundItem.quantity} available in the Store.`,
              style: 'warning',
              totalprice,
              items: invoiceItems,
              salesinvoiceID: invoiceid,
          };
          return res.render('home', { data });
      }
  } catch (err) {
      console.error("Error in item search:", err);
      
      const invoiceItems = await getInvoiceItemsById(req.body.invoiceid);
      let        totalprice = invoiceItems.reduce((sum, item) => sum + item.total, 0);
      
      const data = {
        totalprice,
          title: "sales/addinvoice",
          msg: "An error occurred while searching for or adding items.",
          style: 'danger',
          salesinvoiceID: req.body.invoiceid || '',
      };
      return res.render('home', { data });
  }
};

  
  

 //================================================================
 
 //================================================================
 
 //================================================================








  const updateSalesInvoiceItem = async (req, res) => {
    const { quantity, invoiceid, salesinvoiceitemID, price,itemid } = req.body; 
    const total = quantity * price;
  
    const invoiceItems  = await getInvoiceItemsById(invoiceid);  
    const targetitem= await getBysalesinvoiceitemID(salesinvoiceitemID)  
  console.log("targetitem"+JSON.stringify(targetitem));

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
          const invoiceItemno  = await getInvoiceItemsById(invoiceid);  

          let totalprice = invoiceItemno .reduce((sum, item) => sum + item.price, 0);
            const data = {
                title: "sales/addinvoice",
                msg: "No item was updated.",
                style: 'warning',
                items: invoiceItemno,
                totalprice ,
                salesinvoiceID: invoiceid
            };
            return res.render('home', { data });
        }

        // Fetch updated items after the update
    
//================================================================
const altequanittiy=await targetitem[0].Quantity;
console.log("altqunit: " + altequanittiy);
console.log("newquanity: " + quantity);


 const deltaqunitity=quantity-altequanittiy;
 console.log("deltaqunitity: " + deltaqunitity);
 console.log("itme id: " + itemid);

    await updatequanity(itemid,deltaqunitity);


//===========================================================

const invoiceItemafter  = await await getInvoiceById(invoiceid); ;  

let totalprice = invoiceItemafter.reduce((sum, item) => sum + item.total, 0);

//=====================================
        const data = {
          totalprice,
            title: "sales/addinvoice",
            msg: "Quantity has been updated successfully."+totalprice,
            style: 'success',
            items: invoiceItemafter,
            salesinvoiceID: invoiceid
        };
        return res.render('home', { data });

    } catch (err) {

      const invoiceItems  = await getInvoiceItemsById(invoiceid);  
let totalprice = invoiceItems .reduce((sum, item) => sum + item.total, 0);
        const data = {
            title: "sales/addinvoice",
            msg: "An error occurred while updating the item.",
            style: 'danger',
            totalprice,
            items: invoiceItems, // You can refetch items if needed
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

      const invoiceItem = await getInvoiceItemsById(invoiceid);  
      let totalprice = invoiceItem.reduce((sum, item) => sum + item.total, 0);
      if (result.affectedRows === 0) {
          console.log("No item found to delete.");

       

          const data = {
              title: "sales/addinvoice",
              msg: "No item found to delete.",
              style: 'warning',
              items: invoiceItem,
              totalprice,
              salesinvoiceID: invoiceid
          };
          return res.render('home', { data });
      }

      // Fetch the updated list of items after successful deletion
      const invoiceItems = await getInvoiceItemsById(invoiceid);  
      let totalprice2 = invoiceItems.reduce((sum, item) => sum + item.total, 0);

      //================================================================
   
      await updatequanity(itemid,-quantity);
      //================================================================

      const data = {
 
        title: "sales/addinvoice",
        msg: "Item has been deleted Successfully", 
        style: 'danger',
        totalprice:totalprice2,
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

  const supplier=await getSupplierData();
  const user = await getEmployees();
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
        supplier,user,
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
      supplier,user,
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
    
        
      
       
       // await Promise.all(invoiceitems.map(item =>    updatequanity(item.itemid , item.Quantity *(-1))));
    
        for (const item of invoiceitems) {
          await updatequanity(item.itemid, -item.Quantity);
        }
      
    
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
    

        const invoiceItems = await getInvoiceItemsById(id);  
        let totalprice = invoiceItems.reduce((sum, item) => sum + item.total, 0);
        const supplier=await getSupplierData();
        const user = await getEmployees();
       
        const data = {
          totalprice,user,supplier,
          title: "sales/salesinvoice",
          msg: `Invoice   has been deleted successfully`,
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



const pdf = require('html-pdf');










// Assuming getInvoiceById and getInvoiceItemsById are defined elsewhere







const puppeteer = require('puppeteer');
const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const pdfsalesinvoic = async (req, res) => {
  console.log("Generating PDF for invoice...");
  
  try {
    const id = req.params.id;
    const employee_id = res.locals.user.employee_id;

    // Read EJS Template
    const ejsTemplatePath = path.join(__dirname, '../views/sales/pdftamplet.ejs');
    const ejsTemplate = fs.readFileSync(ejsTemplatePath, 'utf8');

    // Fetch invoice and items
    const invoice = await getInvoiceById(id); 
    const items = await getInvoiceItemsById(id); 

    // Prepare data for EJS
    const data = {
      totalPrice: invoice.totalprice,
      user: res.locals.user,
      date_edit: invoice.date_edit,
      edited_by: invoice.edited_by,
      salesinvoiceID: id,
      invoice: invoice,
      items: items
    };
    console.log("Data for EJS:", JSON.stringify(data, null, 2));

    // Render HTML
    const htmlContent = ejs.render(ejsTemplate, { data });
    fs.writeFileSync('output.html', htmlContent); // For debugging

    const browser = await puppeteer.launch({ headless: false }); // Use headless: true for production
    const page = await browser.newPage();

    // Set content and wait for it to load
    await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { 
          top: '10mm', 
          right: '10mm', 
          bottom: '10mm', 
          left: '10mm' 
      }
    });

    // Close browser
    await browser.close();

    // Send PDF response
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=invoice_${id}.pdf`,
    });

    res.send(pdfBuffer);
  } catch (err) {
    console.error('Error generating PDF:', err);
    res.status(500).send('An error occurred while generating the invoice.');
  }
};





const addeditename = async (req, res) => {
  try {
    const id = req.params.id; // Get invoice ID from the URL
    const newname = req.body.clientname; // Get the new client name from the request body
    console.log("id " + id); 
    console.log("name " + newname); 
    
    // Get the current date and the employee ID
    const currentDate = new Date();
    const employee_id = res.locals.user.employee_id;

    // Update the client's name, edited_by, and date_edit fields in the salesinvoice table
    const sql = `
      UPDATE salesinvoice 
      SET NameClient = ?, edited_by = ?, date_edit = ? 
      WHERE salesinvoiceID = ?
    `;
    
    // Run the query with the provided parameters
    const done = await runQuery(sql, [newname, employee_id, currentDate, id]);

    if (done.affectedRows > 0) {
      // Redirect to the sales invoice page if the update was successful
      res.redirect(`/salesinvoice`);
    } else {
      // If no rows were affected, something went wrong
      res.status(400).send("Failed to update the client name.");
    }
  } catch (err) {
    console.error("Error updating client name:", err);
    res.status(500).send("An error occurred while updating the client name.");
  }
};







module.exports = {salesinvocepage,deleteinvoice,addedite,editedite,deleteedite,
  addsalesinvocepage,
  searchItemController,editinvoicepage,
  updateSalesInvoiceItem,deleteinvoicecontroller,
  deleteSalesInvoiceItem,
  createthevoicecontroller,
  viewinvoicepagecontroller,pdfsalesinvoic,addeditename,

}




const updateitemainvoice = async (req, res, title = "sales/addinvoice") => {
  const { quantity, invoiceid, salesinvoiceitemID, price } = req.body;
  const id = req.params.id;
  const total = quantity * price;
  const employee_id = res.locals.user.employee_id;

  const invoice = await getInvoiceById(id);
  const items = await getInvoiceItemsById(id);

  try {
      // Fetch invoice items for the given invoice ID
     
      if (!items.length!=0) {
          console.log("No invoice items found.");
          return res.render('home', {
              data: {
                  title,
                  msg: "No invoice items found.",
                  style: 'warning',
                  items: items,
                  invoice: invoice
              }
          });
      }

      const itemid = items[0].itemid;
      const altequanittiy = items[0].Quantity;
      const updatedquanity = altequanittiy - quantity;
      const deltaqunitity = quantity - altequanittiy; // Calculate the delta quantity

     
     

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


      const sqlUpdateinoice = `UPDATE salesinvoice SET edited_by = ?, date_edit = ? WHERE salesinvoiceID = ?`;
      const currentDate = new Date();
      db.query(sqlUpdateinoice, [employee_id, currentDate, id], (err, result) => {
        if (err) {
          console.error("Error updating salesinvoice:", err);
          return;
        }
        console.log("Invoice updated successfully:", result);
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
      const itemsafter = await getInvoiceItemsById(id);

      // Update the item quantity in the store
      await updatequanity(itemid, deltaqunitity);

      // Calculate the total price of all invoice items
      let totalPrice = 0;
      itemsafter.forEach(item => {
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
              items:  itemsafter,
              invoice: invoice
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
              invoice:invoice
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
      const sqlUpdate = `UPDATE salesinvoice SET edited_by = ?, date_edit = ? WHERE salesinvoiceID = ?`;
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

  const id = req.params.id; 
  const { invoiceid, salesinvoiceitemID, itemid, quantity } = req.body;

  const employee_id = res.locals.user.employee_id;

  // SQL query to delete the sales invoice item
  const sql = `DELETE FROM salesinvoiceitem WHERE salesinvoiceitemID = ?`;
  
  db.query(sql, [salesinvoiceitemID], async (err, result) => {
      if (err) {
          console.error("Error deleting sales invoice item:", err);
          return res.status(500).send("Error deleting sales invoice item.");
      }

      const invoice = await getInvoiceById(id);
      const items = await getInvoiceItemsById(id);
      if (result.affectedRows === 0) {
          console.log("No item found to delete.");

          // Fetch the updated list of items after the deletion attempt
         
          console.log("Invoice:", JSON.stringify(invoice, null, 2));
          console.log("Invoice Items Before Add:", JSON.stringify(items, null, 2));
          const data = {
              title,
              msg: "No item found to delete.",
              style: 'warning',
              items: items,
              invoice:  invoice
          };
          return res.render('home', { data });
      }

      // Fetch the updated list of items after successful deletion


      //================================================================
      let totalPrice = 0;
      items.forEach(item => {
        totalPrice += item.total; // Assuming 'total' is the field in the database for each item’s total price
      });
      await updatequanity(itemid,-quantity);
      //================================================================

      console.log("Invoice:", JSON.stringify(invoice, null, 2));
      console.log("Invoice Items Before Add:", JSON.stringify(items, null, 2));


      const sqlUpdateinoice = `UPDATE salesinvoice SET edited_by = ?, date_edit = ? WHERE salesinvoiceID = ?`;
      const currentDate = new Date();
      db.query(sqlUpdateinoice, [employee_id, currentDate, id], (err, result) => {
        if (err) {
          console.error("Error updating salesinvoice:", err);
          return;
        }
        console.log("Invoice updated successfully:", result);
      });



      const data = {
        totalPrice:totalPrice,
        title,
        msg: `Item ${itemid}  has been deleted Successfully`, 
        style: 'danger',
        items: items,
        invoice:  invoice
    };
    return res.render('home', { data });
  });
};