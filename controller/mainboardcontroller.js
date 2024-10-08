const { db ,getEmployees,getcostsbyid,getcosts,getStoreData,getPromotionData,getItemData,unitsArray, itemStatesArray ,categoriesArray } = require('../controller/db');



const mainboard=async(req,res) => { 

const costs=await getcosts();
const employees=await getEmployees();
    const promotion=await getPromotionData();
    const stores=await getStoreData();


    const data = { title: "costs/dashboard",
        costs,
      stores,
      employees,
   
    
      };

    return  res.render('home', { data });


    }



    const viewcost=async(req,res) => { 
     
        const id=req.params.id;
        const employees=await getEmployees();
        const costs=await getcostsbyid(id);
        console.log("costs: " + JSON.stringify(costs));
        
            const promotion=await getPromotionData();
            const stores=await getStoreData();
        
        
            const data = { title: "costs/view",
                costs:costs[0],
              stores,
              employees,
           
            
              };
        
            return  res.render('home', { data });
        
        
            }

 const editcost=async(req,res) => { 
    const employees=await getEmployees();
    const id=req.params.id;
    const costs=await getcostsbyid(id);
    console.log("costs: " + JSON.stringify(costs));
    
        const promotion=await getPromotionData();
        const stores=await getStoreData();
    
    
        const data = { title: "costs/edit",
            costs:costs[0],
          stores,
          employees,
       
        
          };
    
        return  res.render('home', { data });
    
    
        }


        const addcostpage= async (req, res) => {
      
        
            try {
                const data = { title: "costs/add",
                 
               
                  };
            
                return  res.render('home', { data });
            } catch (error) {
                console.error(error);
                res.render('add-cost', { data: { msg: 'Failed to add cost', style: 'danger' } });
            }
        };
// Add Cost Route
const addcost= async (req, res) => {
    const employees=await getEmployees();
    const { costType, amount, description, referenceID } = req.body;
    const stores=await getStoreData();
    const employeeID = res.locals.user.employee_id;
    const store_id = res.locals.user.storeID ;
 console.log(req.body);
    try {
        await db.query('INSERT INTO costs (costType, amount, description, referenceID, employee_id,store_id) VALUES (?, ?, ?, ?, ?,?)', 
            [costType, amount, description, referenceID, employeeID,store_id]);

            const costs=await getcosts();
        
            const data = 
            {  title: "costs/dashboard",costs,stores,employees,
            msg:"There Cost hass benn successfully added" ,
             style:"success"  
            };
      
          return  res.render('home', { data });
    } catch (error) {
        console.error(error);
        const data = 
        { title: "costs/add",stores,employees,
        msg:"There is error "+error ,
         style:"danger"  
        };
  
      return  res.render('home', { data });
    }
};

// Delete Cost Route
const deletecost = async (req, res) => {
    const employees=await getEmployees();
    const costID = req.params.id; // corrected way to extract costID
    console.log("costID: " + costID);
    const stores=await getStoreData();
    try {
        // Delete the cost entry from the database
        await db.query('DELETE FROM costs WHERE costID = ?', [costID]);

        // Fetch updated list of costs after deletion
        const costs = await getcosts();

        // Prepare the data object with success message
        const data = {
            title: "costs/add",employees,
            costs,stores,
            msg: `Cost ${costID} has been  successfully deleted`,
            style: "danger"
        };

        // Render the home view with updated data
        return res.render('home', { data });
    } catch (error) {
        console.error(error);

        // Render the view with error message in case of failure
        return res.render('home', {
            data: {employees,
                msg: 'Failed to delete cost: ' + error.message,
                style: 'danger'
            }
        });
    }
};

// In your router setup:






const editthecost = async (req, res) => {
    const employees=await getEmployees();
  const   costID = req.params.id;  const stores=await getStoreData();
    const {  costType, amount, description, referenceID } = req.body;
    const employeeID = res.locals.user.employee_id;
    const store_id = res.locals.user.storeID;
    
    console.log(req.body);

    try {
        await db.query('UPDATE costs SET costType = ?, amount = ?, description = ?, referenceID = ?, employee_id = ?, store_id = ? WHERE costID = ?', 
            [costType, amount, description, referenceID, employeeID, store_id, costID]);

      // const costs = await getcosts();

       const costs=await getcostsbyid(costID);
       // res.redirect("/mainboard")
        const data = {
            title: "costs/view",stores,employees,
            costs:costs[0],
            msg: "Cost has been successfully updated",
            style: "success"
        };
         
        return res.render('home', { data });
    } catch (error) {
        console.error(error);

        const data = {
            title: "costs/edit",stores,employees,
            msg: "There was an error updating the cost: " + error,
            style: "danger"
        };

        return res.render('home', { data });
    }
};



const searchcost = async (req, res) => {
    const employees=await getEmployees();
    const stores=await getStoreData();
    try {
        const employee = res.locals.user;;
        const store_id = res.locals.user.storeID;
     
        const searchTerm = req.body.search || '';
        const sql = `
            SELECT * FROM costs
            WHERE costID = ? 
            OR costType LIKE ? 
            OR referenceID = ?`;

        const searchQuery = `%${searchTerm}%`; 

        const itemResults = await new Promise((resolve, reject) => {
            db.query(sql, [searchTerm, searchQuery, searchTerm], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        console.log("Object results: ", itemResults);

        if (itemResults.length === 0) {
            const data = {
                title: "costs/dashboard",employees,
                costs: [],
                msg: "There is no invoice found.",
                style: "danger"
            };
            return res.render('home', { data });
        }

        const data = {
            title: "costs/dashboard",stores,
            costs: itemResults,employees,
            stores, // Ensure stores variable is populated or handled accordingly
        };

        return res.render('home', { data });

    } catch (err) {
        console.error("Error in item search: ", err);
        const data = {
            title: "costs/dashboard",
            costs: [],stores,employees,
            msg: "There was an error processing your request.",
            style: "danger"
        };
        return res.render('home', { data });
    }
};






module.exports = {
    mainboard,viewcost,editcost,addcost,addcostpage, deletecost,editthecost,searchcost
};
