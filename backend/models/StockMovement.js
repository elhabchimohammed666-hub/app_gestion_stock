const mongoose = require('mongoose');

const StockMovementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  operationType: { 
    type: String, 
    enum: ['reception', 'livraison', 'vente_pos', 'transfert', 'ajustement', 'manuel'], 
    required: true 
  },
  referenceDoc: { type: String, default: '' },
  quantityChanged: { type: Number, required: true }, // Positif pour entrée, négatif pour sortie
  previousStock: { type: Number, required: true },
  newStock: { type: Number, required: true },
  location: { type: String, default: 'WH/Stock' },
  user: { type: String, default: 'Administrateur' },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('StockMovement', StockMovementSchema);
