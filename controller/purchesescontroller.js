const { db,  getStoreData,  getUser, getpurchesesinvoice,getSupplierData, getpurchesesinvoicebyid,runQuery ,updatequanity,getpurcheseitem ,getpurcheseitembyid} = require('./db');
                                                                                                                 
const purchaseInvoicePage = async (req, res) =>  { 
 
  const invoices = await getpurchesesinvoice();

        console.log("invoices", JSON.stringify(invoices));
        const data = {
          title: "purchases/purchesesinvoice",
   
          style: 'danger',
          items: invoices,
        
      };
      return res.render('home', { data });
}






const addpurchaseinvocepage=async(req, res) => { 
  const PurchaseDate = new Date(); // Get the current date and time
  const Price = 0; // Initial total price
  const employee_id = res.locals.user.employee_id; // Employee ID from session
   // Get the client name from the request body

  // Prepare SQL query for inserting a new sales invoice
  const sql = `
    INSERT INTO purchase (PurchaseDate, employee_id)
    VALUES (?, ?)
  `;
  console.log(sql);
  
  const invoices = await getpurchesesinvoice();
  const supplier=await getSupplierData();
 const store=await getStoreData();
 db.query(sql, [PurchaseDate,  employee_id], async (err, result) => {
    if (err) {
      // Handle error case
      console.error('Error inserting new sales invoice:', err);
     



      const data = {
        title: "purchases/purchesesinvoice",
 
        style: 'danger',
        items: invoices,
      
    };
    return res.render('home', { data });
    }

    console.log("result:", result);
      const supplier=await getSupplierData();

    const data = {
      title: "purchases/addpurchesesinvoice",
      msg: "Sales invoice created successfully.",
      style: 'success',
      supplier,
      store,
      invoice:invoices,
      PurchaseID : result.insertId // Correctly access the insertId from the result
    };
  console.log("result.insertId"+result.insertId);
    return res.render('home', { data });
  });
 }




 const addourchesItemController = async (req, res) => {

  const { purchaseID, search, quantity,StoreID,purcheseprice,employee_id } = req.body;
  console.log(req.body);
  const searchTerm = search ? search.trim() : '';
  const invoices = await getpurchesesinvoice();
  const supplier=await getSupplierData();
 const store=await getStoreData();
  try {
    // Extract form data
  
//=====================

                                   
const invoiceItemsbeforadd = await getpurcheseitem(purchaseID);

console.log("0");
    // Validate required fields
    if (!purchaseID|| !searchTerm || !quantity || isNaN(quantity) || quantity <= 0) {
      const data = {
        title: "purchases/addpurchesesinvoice",
        msg: "Fill all required  fields",
        style: 'warning',
        supplier,
        store,
        showadd:true,
        items:invoiceItemsbeforadd,
        invoice:invoices,
        PurchaseID:purchaseID,
      };

      return res.render('home', { data });
    }
    
    const sql = `
      SELECT * FROM item 
      WHERE Barcode = ? AND StoreID =?
    `;
    console.log(sql);
    // Fetch item by barcode
    const itemResults = await new Promise((resolve, reject) => {
      db.query(sql, [searchTerm,StoreID], (err, results) => {
        if (err) return reject(err);
        resolve(results);
      });
    });

    // Handle case where no item was found
    if (itemResults.length === 0) {
      console.log("itemResults.length === 0");
      const data = {
        title: "purchases/addpurchesesinvoice",
        msg: "No item with this barcode found in this store. You must add this barcode to the items. ",
        style: 'warning',
        supplier,
        store,
        showadd:false,
        items:invoiceItemsbeforadd,
        invoice:invoices,
        PurchaseID:purchaseID,
      };

      return res.render('home', { data });
    }

    // Extract the first found item
    const foundItem = itemResults[0];
    const parsedQuantity = parseInt(quantity, 10);
  
    const total = parsedQuantity * purcheseprice;
    const itemid = foundItem.ItemID;

    console.log("itemid"+itemid);
    console.log("total"+total);
   

  if (foundItem.quantity>=quantity &&quantity>0 ) {
      const sqlAdd = `
        INSERT INTO purchaseitem (itemID, purchaseID, Quantity, Price, item_name,baracode,totalprice)
        VALUES (?, ?, ?, ?, ?,?,?)
      `;
     console.log(sqlAdd );
      await new Promise((resolve, reject) => {
        db.query(sqlAdd, [itemid, purchaseID, quantity, purcheseprice,foundItem.ItemName,foundItem.Barcode,total], (err, result) => {
          if (err) return reject(err);
          resolve(result);
        });
      });

      console.log("updating quanity price");
    await updatequanity(itemid,-quantity);

    console.log("updating quanity price after");
    const invoiceItems=await  getpurcheseitem(purchaseID);
                            
  //================================================================
  let totalPrice = 0;
  console.log("totalPrice"+totalPrice);
  invoiceItems.forEach(item => {
    totalPrice += item.totalprice; // Assuming 'total' is the field in the database for each item’s total price
  });
  
  console.log("Final Total Price:", totalPrice);


  //===================================================
      // Success: Render the updated list of items with a success message
   
   

      const data = {
        title: "purchases/addpurchesesinvoice",
        msg: `Item "${foundItem.ItemName}" (ID: ${foundItem.ItemID}) successfully added to invoice.`,
        style: 'success',
        supplier,
        totalPrice,
        store,
        showadd:true,
        items:invoiceItems,
        invoice:invoices,
        PurchaseID:purchaseID,
      };

      return res.render('home', { data });



  }
  else{


    const invoiceItems = await  getpurcheseitem (purchaseID);



    const data = {
      title: "purchases/addpurchesesinvoice",
      msg: "No item with this Barecode founden in this store ,you muss add this Baracode in the Items for this Store ",
      style: 'warning',
      supplier,
      store,
      showadd:false,
      items:invoiceItems ,
      invoice:invoices,
      PurchaseID:purchaseID,
    };

    return res.render('home', { data });

  }
//================================================================



//================================================================
    // Fetch updated items for the sales invoice, join with item table to get more info
  

  } catch (err) {
    const invoiceItems = await  getpurcheseitem  (purchaseID);



    const data = {
      title: "purchases/addpurchesesinvoice",
      msg: "there is some error +err",
      style: 'warring',
      supplier,
      store,
      showadd:true,
      items:invoiceItems,
      invoice:invoices,
      PurchaseID:purchaseID,
    };

    return res.render('home', { data });
  }
};




const deletePurchasesitem=async(req, res) => {deleteitem(req, res, title = 'purchases/addpurchesesinvoice');}
const  updatepurchesitem =async(req, res) => {updateitemainvoice (req, res, title = 'purchases/addpurchesesinvoice');}




const createthevoicepurchesecontroller = async (req, res) => {
  const { supplierID, totalprice, employee_id, invoiceid } = req.body;

  console.log(req.body);


  const invoice = await getpurchesesinvoicebyid(invoiceid);
   
     const sqlvoices =await getpurchesesinvoice();
const items=await getpurcheseitem(invoiceid);
  const supplier = await getSupplierData();
  const store = await getStoreData();

  // SQL query to update the salesinvoice
  const sqlUpdateInvoice = `
    UPDATE purchase
    SET PurchaseDate = ?, 
        Price = ?, 
        employee_id = ?, 
        supplierID = ? ,
        Quantity =?
    WHERE PurchaseID = ?
  `;

//================================================================


const quanity=items.length;
const date=new Date();
console.log("date: " + date);
//==============================================
  db.query(sqlUpdateInvoice, [date, totalprice, employee_id, supplierID,quanity, invoiceid], async (err, result) => {
    if (err) {
     
    
    
     const data = {
      title:"",
      msg: "Failed to update the invoice."+err,
      style: 'warning',
      supplier,
      store,
      showadd: true,
      items, 
      totalPrice ,
      invoice,
      PurchaseID: invoiceid,
    };

    return res.render('home', { data });


    }

    // If update is successful, fetch all invoices
   
    const invoicesafter =  await getpurchesesinvoice();

    //============================================
    const data = {
      title: "purchases/purchesesinvoice",
         msg:"Invoice updated successfully",
      style: 'success',
      items: invoicesafter,
    
  };
  return res.render('home', { data });

  });
};





module.exports = { purchaseInvoicePage ,updatepurchesitem,
  addpurchaseinvocepage,addourchesItemController,deletePurchasesitem,createthevoicepurchesecontroller

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



const deleteitem = async (req, res, title = 'purchases/addpurchesesinvoice') => {
  const { invoiceid, PurchaseItemid, itemid, quantity } = req.body;
  const employee_id = res.locals.user.employee_id;
  console.log(req.body);

  try {
    const invoice = await getpurchesesinvoicebyid(invoiceid);
    let items = await getpurcheseitem(invoiceid); 

    const supplier = await getSupplierData();
    const store = await getStoreData();

    // SQL query to delete the purchase invoice item
    const sqlDeleteItem = `DELETE FROM purchaseitem WHERE PurchaseItemid = ?`;

    db.query(sqlDeleteItem, [PurchaseItemid], async (err, result) => {
      if (err) {
        console.error("Error deleting purchase invoice item:", err);
        return res.status(500).send("Error deleting purchase invoice item.");
      }

      let totalPrice = 0;
      items.forEach(item => {
        totalPrice  += item.totalprice; // Assuming 'total' is the field for each item's total price
      });
      console.log("totalprice :", totalPrice);
      if (result.affectedRows === 0) {

        
        console.log("No item found to delete.");
        const data = {
          title,
          msg: "No item found to delete.",
          style: 'warning',
          supplier,
          store,
          showadd: true,
          items, totalPrice ,
          invoice,
          PurchaseID: invoiceid,
        };

        return res.render('home', { data });
      }

      // Update quantity and fetch updated items list
      await updatequanity(itemid, quantity);

      // Recalculate total price
   

      // Update the invoice's last edited details
      const sqlUpdateInvoice = `UPDATE purchase SET edited_by = ?, date_edit = ? WHERE PurchaseID = ?`;
      const currentDate = new Date();
      db.query(sqlUpdateInvoice, [employee_id, currentDate, invoiceid], (err, result) => {
        if (err) {
          console.error("Error updating purchase invoice:", err);
          return res.status(500).send("Error updating purchase invoice.");
        }
        console.log("Invoice updated successfully:", result);
      });

      // Fetch the updated list of items
      let updatedItems = await getpurcheseitem(invoiceid);

      let totalPrice3 = 0;
      updatedItems .forEach(item => {
        totalPrice3 += item.totalprice; // Assuming 'total' is the field for each item's total price
      });
 console.log("totalprice 3:", totalPrice3);
      // Prepare data to render after successful deletion
      const data = {
        title,
        msg: `Item ${itemid} has been deleted successfully.`,
        style: 'success',
        supplier,
        store,
        showadd: true,
        items: updatedItems,
        invoice,
        totalPrice:totalPrice3 ,
        PurchaseID: invoiceid,
      };

      return res.render('home', { data });
    });
  } catch (error) {
    console.error("Error in deleteitem function:", error);
    return res.status(500).send("An error occurred while processing your request.");
  }
};

const updateitemainvoice = async (req, res, title = 'purchases/addpurchesesinvoice') => {



  const { invoiceid, PurchaseItemid, itemid, quantity, price } = req.body; // Ensure 'price' is passed in the request
  const employee_id = res.locals.user.employee_id;
  console.log(req.body);
  const totalprice = quantity * price ;  
    console.log("totalPrice"+totalprice  );
  try {
  
    const invoice = await getpurchesesinvoicebyid(invoiceid);
    console.log("invoic",JSON.stringify(invoice));
    let items = await  getpurcheseitem(invoiceid);

    const supplier = await getSupplierData();
    const store = await getStoreData();
    const updateItem = await getpurcheseitembyid(PurchaseItemid);
  


  console.log("updateItemt",JSON.stringify( updateItem));


    // Check if there are items to update
    if (items.length === 0) {
      console.log("items.length === 0");
      const data = {
        title,
        msg: "No items found to update.",
        style: 'warning',
        supplier,
        store,
        showadd: true,
        items,
        totalPrice: 0,
        invoice,
        PurchaseID: invoiceid,
      };
      return res.render('home', { data });
    }
    
   

 
    const sqlUpdate = `UPDATE purchaseitem SET Quantity = ?, totalprice = ? WHERE PurchaseItemid = ?`;
    const result = await runQuery(sqlUpdate, [quantity, totalprice, PurchaseItemid]);

    // Check if the update was successful
    if (result.affectedRows === 0) {
      console.log("No item was updated.");
      const data = {
        title,
        msg: "Failed to update the item.",
        style: 'warning',
        supplier,
        store,
        showadd: true,
        items,
        totalPrice: 0,
        invoice,
        PurchaseID: invoiceid,
      };
      return res.render('home', { data });
    }

    // Update the purchase invoice with the employee who edited and the current date
    const sqlUpdateInvoice = `UPDATE purchase SET edited_by = ?, date_edit = ? WHERE PurchaseID = ?`;
    const currentDate = new Date();
    await runQuery(sqlUpdateInvoice, [employee_id, currentDate, invoiceid]);

    const alteQuantity = updateItem[0].Quantity;
    const deltaquanity = quantity - alteQuantity; // Adjust how the quantity is calculated if necessary
    await updatequanity(itemid, -deltaquanity);

    // Re-fetch updated items after the update
    let updatedItems = await  getpurcheseitem(invoiceid);

    // Recalculate the total price for all items in the invoice
    let totalPrice = updatedItems.reduce((sum, item) => sum + item.totalprice, 0);

    // Render the response with success message
    const data = {
      title,
      msg: `Item ${itemid} has been updated successfully.`,
      style: 'success',
      supplier,
      store,
      showadd: true,
      items: updatedItems,
      totalPrice,
      invoice,
      PurchaseID: invoiceid,
    };
    return res.render('home', { data });

  } catch (err) {
    console.error("An error occurred:", err);
    const data = {
      title,
      msg: "An error occurred while updating the item.",
      style: 'danger',
      supplier: await getSupplierData(),
      store: await getStoreData(),
      showadd: true,
      items: await  getpurcheseitem(invoiceid),
      totalPrice: 0,
      invoice: await getpurchesesinvoicebyid(invoiceid),
      PurchaseID: invoiceid,
    };
    return res.render('home', { data });
  }
};

// Utility function for executing queries with promises





