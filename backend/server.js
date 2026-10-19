const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Static uploads directory
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/contacts', require('./routes/contactRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/pos', require('./routes/posRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'running',
    message: 'API Système de Gestion de Stock, Facturation et POS (Odoo-Style ERP)',
    version: '1.0.0'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Serveur ERP démarré sur le port ${PORT}`);
  console.log(`Point d'accès API: http://localhost:${PORT}/api`);
});
