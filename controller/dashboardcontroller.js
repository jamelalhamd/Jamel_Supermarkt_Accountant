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
const employees_totall=emplyees.length;
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









const data = {
 title:'dashboard/dashboard',
 total_kauf, total_invoice_kaufen,
 total_invoice,total_verkauf,
 promotion_total,costs_total,suppliers_total,totallitems,itemamounts
};
return res.render('home', { data });

}



const getdashboard=async(req,res)=>
    {






}










module.exports = {getdashboard,getdash
 
};