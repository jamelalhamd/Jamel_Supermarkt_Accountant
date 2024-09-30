const { db,  getStoreData,  getUser, getpurchesesinvoice,getSupplierData,getpurchaseitem ,updatequanity,getpurcheseitem } = require('./db');

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


const invoiceItemsbeforadd = await getpurcheseitem (purchaseID);

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

      const invoiceItems = await getpurcheseitem (purchaseID);
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


    const invoiceItems = await getpurcheseitem (purchaseID);



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
    const invoiceItems = await getpurcheseitem (purchaseID);



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







module.exports = { purchaseInvoicePage ,
  addpurchaseinvocepage,addourchesItemController

};
