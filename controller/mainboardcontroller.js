const { db ,getStoreData,getPromotionData,getItemData,unitsArray, itemStatesArray ,categoriesArray } = require('../controller/db');



const mainboard=async(req,res) => { 


    const promotion=await getPromotionData();
    const stores=await getStoreData();
    const items = await getItemData();

    const data = { title: "mainboard/dashboard",
      items,
      stores,
      promotion
   
    
      };

    return  res.render('home', { data });





    
     };



module.exports = {
    mainboard
};
