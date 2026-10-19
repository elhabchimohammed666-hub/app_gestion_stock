const mongoose = require('mongoose');

const PosSessionSchema = new mongoose.Schema({
  sessionNumber: { type: String, required: true, unique: true },
  name: { type: String, required: true }, // e.g. "Shop 1 - Caisse Principale"
  cashier: { type: String, default: 'Administrateur' },
  status: { 
    type: String, 
    enum: ['en_cours', 'fermee'], 
    default: 'en_cours' 
  },
  openingDate: { type: Date, default: Date.now },
  closingDate: { type: Date },
  openingCash: { type: Number, default: 500 }, // DH
  closingCash: { type: Number, default: 0 },
  totalSales: { type: Number, default: 0 },
  ordersCount: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('PosSession', PosSessionSchema);
