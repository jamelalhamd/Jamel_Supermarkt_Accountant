// دالة للتحقق من الأدوار العامة، تستقبل مصفوفة للأدوار المسموح بها
const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    const user = res.locals.user;

    // تحقق من وجود المستخدم ودور الموظف
    if (!user || !user.employee_role) {
      console.log("User or employee_role is undefined.");
      return res.status(403).send('Access Denied: User not found or invalid role.');
    }

    const role = user.employee_role;
    console.log("Role:", role);

    // السماح بالوصول إذا كان الدور موجودًا ضمن الأدوار المسموح بها
    if (allowedRoles.includes(role)) {
      return next();
    }

    // في حالة عدم توفر الإذن
    const data = { title: "Permission Denied" };
    res.render('home', { data });
  };
};

// تعريف المجموعات من الأدوار
const storeBuyerRoles = ["Chef", "Store", "Buyer", "Casher"];
const chefOnly = ["Chef"];
const hrRoles = ["Chef", "HR"];
const accountantRoles = ["Chef", "Accountant"];
const supplierRoles = ["Chef", "Store", "Buyer", "Casher", "Accountant"];
const casherRoles = ["Chef", "Casher", "Sale", "Buyer"];
const saleRoles = ["Chef", "Casher", "Sale", "Buyer"];

// تعريف الميدلوير لكل مجموعة أدوار
const Chef = checkRole(chefOnly);
const Casher = checkRole(casherRoles);
const HR = checkRole(hrRoles);
const Store = checkRole(storeBuyerRoles);
const Buyer = checkRole(storeBuyerRoles);
const Accountant = checkRole(accountantRoles);
const Sale = checkRole(saleRoles);


const allrole = (req, res, next) => {
  const role = res.locals.user?.employee_role;

  if (!role) {
    console.log("Role is undefined.");
    return res.status(403).send('Access Denied: Role not found.');
  }


  if (saleRoles.includes(role)) return Sale(req, res, next);
  if (storeBuyerRoles.includes(role)) return Store(req, res, next);
  if (hrRoles.includes(role)) return HR(req, res, next);
  if (casherRoles.includes(role)) return Casher(req, res, next);
  if (chefOnly.includes(role)) return Chef(req, res, next);
  if (accountantRoles.includes(role)) return Accountant(req, res, next);


  res.status(403).send('Access Denied: Role not authorized.');
};

module.exports = { allrole, Chef, Casher, HR, Store, Buyer, Accountant, Sale };
