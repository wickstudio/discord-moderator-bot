const express = require('express');
const path = require('path');
const router = require('./routes');

const app = express();

// Middlewares
app.use(express.static(path.join(__dirname, "public")));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json({}));
app.use(express.urlencoded({ extended: true }));

// Use routes
app.use(router);


const { PORT } = require('../verify')
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});