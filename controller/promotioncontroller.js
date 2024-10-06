const { db,getPromotionData ,getStoreData, runQuery} = require('../controller/db');

const util = require('util');
// Function to fetch and render all promotions
db.query = util.promisify(db.query);
const promotionViewControl  = async (req, res) => {
  try {
    const promotions = await getPromotionData(); 
    const store = await getStoreData();
    
    // Assuming user is stored in res.locals after authentication middleware
    const user = res.locals.user;

    // Ensure user is defined before logging
    if (user) {
      console.log("user.employee_id " + JSON.stringify(user));
    } else {
      console.log("User is not defined");
    }

    const data = {
      title: 'promation/dashboard',
      promotions: promotions,
      store: store,
      user 
     // Pass user data to the template if needed
    };

    res.render('home', { data }); 
  } catch (err) {
    console.error("Error fetching promotion data:", err);
    res.status(500).send('Server error'); 
  }
};



// Function to fetch and render a specific promotion for editing
const editPromotion = (req, res) => {
  console.log("0");
  const promotionId = req.params.id;
  const sql = 'SELECT * FROM promotion WHERE PromotionID = ?';
  db.query(sql, [promotionId], (err, results) => {
    if (err) {
      console.error("Error fetching promotion data: " + err);
      return res.redirect('/promotions');
    }

    if (results.length === 0) {
      return res.redirect('/promotions');
    }

    const data = {
      title: 'promation/edit',
      promotion: results[0],
      msg: ""
    };
    
    res.render('home', { data });
  });
};

// Function to handle updating a promotion
const updatePromotion = (req, res) => {
  console.log("0");
  const promotionId = req.params.id;
  const { PromotionName, Description, StartDate, EndDate, DiscountPercentage } = req.body;

  if (!PromotionName || !StartDate || !EndDate || !DiscountPercentage) {
    const data = { title: 'promation/edit', msg: "Please fill in all fields", style: "danger", promotion: req.body };
    return res.render('home', { data });
  }

  const sql = 'UPDATE promotion SET PromotionName = ?, Description = ?, StartDate = ?, EndDate = ?, DiscountPercentage = ? WHERE PromotionID = ?';
  db.query(sql, [PromotionName, Description, StartDate, EndDate, DiscountPercentage, promotionId], (err) => {
    if (err) {
      console.error("Error updating promotion data:", err);
      const data = { title: 'promation/edit', msg: "Error updating promotion data: " + err, style: "danger", promotion: req.body };
      return res.render('home', { data });
    }
    console.log("done");
   const data = { title: 'promation/edit', msg: "Promotion updated successfully", style: "success", promotion: { PromotionID: promotionId, PromotionName, Description, StartDate, EndDate, DiscountPercentage } };
   return res.render('home', { data });
 // return res.redirect("/promotions");
  });
};

const addPromotionpage=  (req, res) => {

  const data = { title: 'promation/add'}
   return res.render('home', { data });

}




// Function to handle adding a new promotion
const addPromotion = async (req, res) => {
  const { PromotionName, Description, StartDate, EndDate, DiscountPercentage } = req.body;

  if (!PromotionName || !StartDate || !EndDate || !DiscountPercentage) {
    return res.status(400).send("All fields are required.");
  }

  const sql = 'INSERT INTO promotion (PromotionName, Description, StartDate, EndDate, DiscountPercentage) VALUES (?, ?, ?, ?, ?)';

  try {
    db.query(sql, [PromotionName, Description, StartDate, EndDate, DiscountPercentage],  async (err) => {
      if (err) {
        console.error("Error inserting promotion: " + err);
        const data = { title: 'promation/add', msg: "Promotion has not been added", style: "danger" };
        return res.render('home', { data });
      }
    



      const promotions = await getPromotionData(); 
      const store = await getStoreData();
      const user = res.locals.user;
  
      const data = {
        title: 'promation/dashboard',
        msg: "Promotion has not been successfully added", style: "success" ,
        promotions: promotions,
        store: store,
        user: user
      };
      return res.render('home', { data });
    });
  } catch (err) {
    console.error("Error handling request: " + err);
    res.status(500).send("Server error");
  }
};

const deletePromotionpage = (req, res) => {
  console.log("0");
  const promotionId = req.params.id;
  const sql = 'SELECT * FROM promotion WHERE PromotionID = ?';
  db.query(sql, [promotionId], (err, results) => {
    if (err) {
      console.error("Error fetching promotion data: " + err);
      return res.redirect('/promotions');
    }

    if (results.length === 0) {
      return res.redirect('/promotions');
    }

    const data = {
      title: 'promation/delete',
      promotion: results[0],
      msg: ""
    };
    
    res.render('home', { data });
  });
};


// Function to handle deleting a promotion
const deletePromotion  = async (req, res) => {
  const promotionId = req.params.id;
 console.log(" promotionId"+ promotionId);
  if (!promotionId) {
  
    const data = {
      title: 'promation/delete',
      promotion: [],
      msg: 'No promotion ID provided for deletion'
    };
    return res.render('home', { data });
  }
   const sqlu="Update item SET promotionID =? where promotionID=? ";
  runQuery(sqlu,[null,promotionId]);

  const sql = 'DELETE FROM promotion WHERE PromotionID = ?';
  db.query(sql, [promotionId], async (err, result) => {
    if (err) {
      
      console.error("Error deleting promotion: " + err);

      
      const promotions = await getPromotionData(); 
      const store = await getStoreData();
      const user = res.locals.user;

      const data = {
        msg: "Error occurred while deleting the promotion",
        style: "danger",
        title: 'promation/dashboard',
        promotions: promotions,
        store: store,
        user: user
      };

      return res.render('home', { data });
    }

    if (result.affectedRows === 0) {

      const data = { 
        title: 'promation/delete', 
        msg: 'No promotion found with the given ID', 
        style: "danger", 
        promotions: [] 
      };
      return res.render('home', { data });
    }

  
    const promotions = await getPromotionData(); 
    const store = await getStoreData();
    const user = res.locals.user;

    const data = {
      title: 'promation/dashboard',
      msg: 'Promotion has been successfully deleted',
      style: "danger", 
      promotions: promotions,
      store: store,
      user: user
    };

    return res.render('home', { data });
  });
};

  


















// Function to render the page for adding a new promotion
const addPromotionPage = (req, res) => {
  const data = { title: 'promation/add' };
  res.render('home', { data });
};

// Function to render details of a specific promotion
const promotionViewDetails = async (req, res) => {
  console.log("0");
  const { id } = req.params; // Extract the promotion ID from the request parameters
  console.log(id);
  const sql = 'SELECT * FROM promotion WHERE PromotionID = ?';

  try {
    console.log("1");
    const promotionResults = await new Promise((resolve, reject) => {
      db.query(sql, [id], (err, results) => {
        if (err) {
          return reject(err);
        }
        resolve(results);
      });
    });
    console.log("2");
    if (promotionResults.length === 0) {
      return res.status(404).render('home', { title: 'promotion/dashboard', msg: `Promotion with ID ${id} not found.`, style: 'danger' });
    }

    const data = {
      title: 'promation/view',
      promotion: promotionResults[0]
    };

    res.render('home', { data });
  } catch (err) {
    console.error("Database error: " + err);
    return res.redirect("/promotionview");
  }
};




const searchPromotionController = async (req, res) => {
  console.log("0");
  const searchTerm = req.body.search ? req.body.search : '';  // Überprüfen, ob ein Suchbegriff vorhanden ist

  console.log("searchTerm: " + searchTerm);
  console.log("1");

  try {
    // SQL-Abfrage ohne die Beschreibungssuche
    const sql = `
      SELECT * FROM promotion 
      WHERE PromotionID = ? 
      OR PromotionName LIKE ?
    `;
    const searchQuery = `%${searchTerm}%`;  // Erstellen eines Musters für die LIKE-Suche

    // Datenbankabfrage ausführen mit async/await
    const promotionResults = await new Promise((resolve, reject) => {
      db.query(sql, [searchTerm, searchQuery], (err, results) => {
        if (err) {
          console.error("Fehler beim Abrufen der Promotion-Daten: " + err);
          return res.redirect("404");  // Umleitung zur Fehlerseite bei einem Fehler
        }
        resolve(results);  // Rückgabe der Ergebnisse
      });
    });

    // Überprüfen, ob keine Promotion gefunden wurde
    if (promotionResults.length === 0) {
      console.log("Keine Promotion für den Suchbegriff gefunden: " + searchTerm);
      const data = { title: 'promation/dashboard', promotions: [], msg: 'Keine Promotion gefunden' };
      return res.render('home', { data });  // Zurückgeben einer leeren Liste, wenn keine Promotion gefunden wird
    }

    // Wenn Promotionen gefunden werden, strukturieren der Daten
    console.log("Promotion-Daten erfolgreich abgerufen");
    const data = {
      title: 'promation/dashboard',
      promotions: promotionResults
    };

    console.log("Promotion-Daten: " + JSON.stringify(promotionResults, null, 2));

    // Rendering der Ansicht mit den Promotion-Daten
    res.render('home', { data });
  } catch (err) {
    // Fehlerbehandlung
    console.error("Fehler bei der Promotion-Suche: " + err);
    const data = { title: 'promation/dashboard', msg: "Fehler beim Abrufen der Promotion-Daten" };
    res.render('home', { data });  // Rückgabe eines Fehlers bei Problemen
  }
};










// Export all handlers
module.exports = {
  deletePromotionpage,
  searchPromotionController,
  promotionViewControl,
  editPromotion,
  updatePromotion,
  addPromotionpage,
  addPromotion,
  deletePromotion,
  addPromotionPage,
  promotionViewDetails
};
