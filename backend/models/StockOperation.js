const mongoose = require('mongoose');

const StockOperationLineSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  demandedQuantity: { type: Number, required: true, min: 0 },
  doneQuantity: { type: Number, required: true, min: 0 }
});

const StockOperationSchema = new mongoose.Schema({
  reference: { type: String, required: true, unique: true }, // e.g. WH/IN/00001, WH/OUT/00001, WH/INT/00001
  type: { 
    type: String, 
    enum: ['reception', 'livraison', 'transfert', 'ajustement'], 
    required: true 
  },
  partner: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  partnerName: { type: String, default: '' },
  sourceLocation: { type: String, default: 'Fournisseurs' },
  destinationLocation: { type: String, default: 'WH/Stock' },
  sourceDocument: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  status: { 
    type: String, 
    enum: ['brouillon', 'pret', 'fait', 'annule'], 
    default: 'brouillon' 
  },
  items: [StockOperationLineSchema],
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('StockOperation', StockOperationSchema);
