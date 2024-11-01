const express = require('express');
const path = require('path');


const app = express();

app.use(express.static('public'));
const port = process.env.PORT || 3000;




const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// Middleware for Content-Security-Policy
app.use((req, res, next) => {
  res.setHeader("Content-Security-Policy", 
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:35729; " +
    "style-src 'self' https: 'unsafe-inline'; " +
    "font-src 'self' https: data:; " +
    "img-src 'self' data:; " +  // السماح بتحميل الصور من نوع data:
    "worker-src 'self' blob:; " +
    "connect-src 'self' ws://localhost:35729;" // السماح بالاتصالات عبر WebSocket
  );
  next();
});



// Helmet configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "http://localhost:35729","https://cdn.jsdelivr.net"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:", "data:"],
      imgSrc: ["'self'", "data:"],
      workerSrc: ["'self'", "blob:"],
      connectSrc: ["'self'", "ws://localhost:35729"]
    }
  }
}));
//================================================================


const expressLayouts = require('express-ejs-layouts');


//================================================================

// Middleware and Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Security Middleware
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
});
app.use(limiter);

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Livereload Setup
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, 'public'));
app.use(connectLivereload());
liveReloadServer.server.once('connection', () => {
  setTimeout(() => {
    liveReloadServer.refresh('/');
  }, 100);
});

// Routes
const productRoutes = require('./route/pruductroute'); // Correct the path if needed
const userRoutes = require('./route/userrout'); // Correct the path if needed
const store_item_suppler_Route = require("./route/store_item_suppler_route");
const itemcontroller = require('./route/itemroute');

const Promotion_Route = require("./route/promationroute");
const Sales_Route = require("./route/salesroute");
const Stock_Route = require("./route/stockroute");
const mainboard_Route = require("./route/costroute");

const purchesese_Route = require("./route/purchesesroute");
const dashboard_Route = require("./route/dashboardcontrollerroute");
const print_Route = require("./route/printroute");
app.use(purchesese_Route);
app.use(Sales_Route);
app.use(itemcontroller);
app.use(productRoutes);
app.use(userRoutes);
app.use(Stock_Route);
app.use(mainboard_Route);
app.use(dashboard_Route);
app.use(store_item_suppler_Route);
app.use(Promotion_Route);
app.use(print_Route);

// Test Route


// Basic Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something went wrong!');
});

// 404 Handler
app.use((req, res) => {
  res.status(404).render('404');
});

// Server Listening
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
//================================================================







//===========================================
