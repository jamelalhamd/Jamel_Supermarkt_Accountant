const { db,  getStoreData,getItemData,
     getSupplierbyid , getUser,getEmployees,
      getpurchesesinvoice,getSupplierData,
       getpurchesesinvoicebyid,runQuery ,
       updatequanity,getpurcheseitem ,
       getPromotionData,getInvoice,
       getcosts,
       getpurcheseitembyid} = require('./db');                                                                                                               




const getdash=async(req,res)=>
    {

const items=await getItemData ();


const totallitems=items.length;
console.log(totallitems);


let itemamounts=0;

items.forEach(item => {
    itemamounts+=item.quantity;
    
});

console.log( itemamounts);

//============================================================================

const  emplyees=await getEmployees();
const employees_total=emplyees.length;
console.log(emplyees.length);

//============================================================================

const  suppliers=await getSupplierData();
const suppliers_total=suppliers.length;
console.log(suppliers.length);

//============================================================================

const costs=await getcosts();

let costs_total=0;

costs.forEach(cost => {
    costs_total+=cost.amount;
    
});

console.log(costs_total);
//============================================================================

const promotion=await getPromotionData()
 promotion_total=promotion.length;
 console.log( promotion_total);
 //============================================================================
const invoice=await getInvoice();

let total_invoice=invoice.length;

console.log("total_invoice: " + total_invoice);

let total_verkauf=0;
invoice.forEach(invoice => {
    total_verkauf+=invoice.totalprice;
    
});
console.log(total_verkauf)

//====================================

 const kaufen= await getpurchesesinvoice();
  const total_invoice_kaufen=kaufen.length;
  console.log("total_invoice_kaufen"+kaufen.length)

let total_kauf=0;
kaufen.forEach(invoice => {
    total_kauf+=invoice.Price;
    
});
console.log(total_kauf)

//====================================



//const profits=(data.total_verkauf)-(data.costs_total+data.total_kauf);




const data = {
 title:'dashboard/dashboard',
 total_kauf, total_invoice_kaufen,employees_total,
 total_invoice,total_verkauf,
 promotion_total,costs_total,suppliers_total,totallitems,itemamounts
};
return res.render('home', { data });

}










const showdashboard=async(req,res)=>
   
        {
    
          const date1 = req.body.fromdate ? req.body.fromdate : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago if not provided
          const date2 = req.body.todate ? req.body.todate : new Date(); // current date if not provided
          
          

console.log("body"+date1);
console.log("body"+date2)

    const items=await getItemData ();
    
    
    const totallitems=items.length;
    console.log(totallitems);
    
    
    let itemamounts=0;
    
    items.forEach(item => {
        itemamounts+=item.quantity;
        
    });
    
    console.log( itemamounts);
    
    //============================================================================
    
    const  emplyees=await getEmployees();
    const employees_total=emplyees.length;
    console.log(emplyees.length);
    
    //============================================================================
    
    const  suppliers=await getSupplierData();
    const suppliers_total=suppliers.length;
    console.log(suppliers.length);
    
    //============================================================================
    
    const costs=await getcostsdated(date1,date2);
    
    let costs_total=0;
    
    costs.forEach(cost => {
        costs_total+=cost.amount;
        
    });
    
    console.log(costs_total);
    //============================================================================
    
    const promotion=await getPromotionDatadated(date1,date2)
     promotion_total=promotion.length;
     console.log( promotion_total);
     //============================================================================
    const invoice=await getInvoicedated(date1,date2);
     console.log("invoice" ,JSON.stringify(invoice));;
    let total_invoice=invoice.length;
    
    console.log("total_invoice: " + total_invoice);
    
    let total_verkauf=0;
    invoice.forEach(invoice => {
        total_verkauf+=invoice.totalprice;
        
    });
    console.log("total_verkauf : "+total_verkauf);
    
    //====================================
    
     const kaufen= await getPurchasesInvoicedated(date1,date2);
      const total_invoice_kaufen=kaufen.length;
      console.log("total_invoice_kaufen"+kaufen.length)
    
    let total_kauf=0;
    kaufen.forEach(invoice => {
        total_kauf+=invoice.Price;
        
    });
    console.log("total_kauf : "+total_kauf);
    
    //====================================
    
    
    
    //const profits=(data.total_verkauf)-(data.costs_total+data.total_kauf);
    
    
    
    
    const data = {
        date1,date2,
     title:'dashboard/dashboard',
     total_kauf, total_invoice_kaufen,employees_total,
     total_invoice,total_verkauf,
     promotion_total,costs_total,suppliers_total,totallitems,itemamounts
    };
    return res.render('home', { data });
    
    }









module.exports = {showdashboard,getdash
 
};





const getcostsdated = async (date1, date2) => {
    try {
        // SQL query to select all costs between the given dates
        const Sql = "SELECT * FROM costs WHERE CreatedAt BETWEEN ? AND ?";
        
        // Await the result of the database query, passing the date parameters
        const result = await runQuery(Sql, [date1, date2]);
        
        // Return the result
        return result;
    } catch (error) {
        // Log the error for debugging
        console.error("Error retrieving costs:", error);
        // Optionally, rethrow the error after logging it
        throw error;
    }
};























const getPromotionDatadated = () => {
    return new Promise((resolve, reject) => {
        const datenow = new Date(); // Current date and time
        const promotionQuery = 'SELECT * FROM promotion WHERE StartDate <= ? AND EndDate >= ?'; 
        
        // Execute the query with the current date as both parameters
        db.query(promotionQuery, [datenow, datenow], (err, promotionResults) => {
            if (err) {
                console.error("Error fetching promotion data: " + err);
                return reject("Error fetching promotion data: " + err);
            }
            resolve(promotionResults); 
        });
    });
};


const getInvoicedated = async ( date1, date2) => {
    // SQL query to select invoices by ID and date range
    const sqlInvoice = `SELECT * FROM salesinvoice WHERE  salesinvoiceDate BETWEEN ? AND ?`;
  
    try {
      const invoicedata = await new Promise((resolve, reject) => {
        db.query(sqlInvoice, [ date1, date2], (err, results) => {
          if (err) return reject(err);
          resolve(results); // Resolve the query results
        });
      });
  
      return invoicedata; // Return the fetched invoice data
    } catch (error) {
      throw new Error(`Error fetching invoice with ID ${id}: ${error.message}`);
    }
  };
  






  const getPurchasesInvoicedated = async (date1, date2) => {
    try {
      const sqlvoices = `SELECT * FROM purchase WHERE PurchaseDate BETWEEN ? AND ?`;
      
      const invoices = await new Promise((resolve, reject) => {
        db.query(sqlvoices, [date1, date2], (err, results) => {
          if (err) {
            console.error("Error fetching purchase invoices:", err);
            return reject(err); // Reject the promise with the error
          }
          resolve(results); // Resolve with the query results
        });
      });
  
      return invoices; // Return the result set of purchase invoices
  
    } catch (error) {
      console.error("Error fetching purchase invoices:", error.message);
      return null; // Return null in case of an error
    }
  };
  


  const getBysalesinvoiceitemIDdate = async (date1,date2) => {
    const sqlInvoiceItems = `SELECT * FROM salesinvoiceitem WHERE salesinvoiceitemID = ?`;
  
    try {
      const invoiceitemdata = await new Promise((resolve, reject) => {
        db.query(sqlInvoiceItems, [id], (err, results) => {
          if (err) return reject(err);
          resolve(results); // Return all invoice items
        });
      });
  
      return invoiceitemdata;
    } catch (error) {
      throw new Error(`Error fetching invoice items for invoice ID ${id}: ${error.message}`);
    }
  };



  const getpurchesesinvoicebydated= async (date1,date2) => {
    try {
      const sqlvoices = `SELECT * FROM purchase WHERE PurchaseID=? `;
      const invoices = await new Promise((resolve, reject) => {
        db.query(sqlvoices,[id], (err, results) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
  
   
      return invoices ;
      // Alternatively, if you want to return JSON:
      // return res.json(invoices);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      return null;
    }
  };