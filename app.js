const express = require('express');
const path = require('path');
const app = express();
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
  res.setHeader("Content-Security-Policy", "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net http://localhost:35729; style-src 'self' https: 'unsafe-inline'; font-src 'self' https: data:;");
  next();
});

// Middleware and Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(cookieParser());

// Security Middleware
app.use(helmet());  // Helmet should be used after setting CSP for improved security
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

app.use(productRoutes);
app.use(userRoutes);

// Test Route
app.get("/test", (req, res) => {
  const data = null;
  console.log("error................................................................");
  res.render('home', { data: data });
});

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
