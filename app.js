const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const errorHandler = require('./middleware/errorHandler');
const routes = require('./routes/index.js');

const app = express();

// Database connection
mongoose.connect('mongodb+srv://joeshwoageorge:J0eshwoa@jodb.0fzmbui.mongodb.net/Fixer', {  })
  .then(() => console.log('Connected to database'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/', routes);

// Error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
