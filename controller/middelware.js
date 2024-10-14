const checkRole = (requiredRole) => {
    return (req, res, next) => {
      const user = res.locals.user;
  
      if (!user || !user.employee_role) {
        console.log("User or employee_role is undefined.");
        return res.status(403).send('Access Denied: User not found or invalid role.');
      }
  
      const role = user.employee_role;
      console.log("Role:", role);
  
      if (role === requiredRole || role === 'Chef') {  // Allow Chef access too if required
        return next();
      }
  

      const data = { title: "permision",
     
        };
      res.render('home', { data });
 
    };
  };
  
  // Specific role-check middlewares
  const Chef = checkRole('Chef');
  const Casher = checkRole('Casher');
  const HR = checkRole('HR');
  const Store = checkRole('Store');
  const Buyer = checkRole('Buyer');
  const Accountant = checkRole('Accountant');
  const Sale = checkRole('Sale');
  
  // Export or use middlewares as needed
  module.exports = {Buyer, Store, HR, Casher, Chef, Accountant,Sale};
  