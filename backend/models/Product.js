const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  reference: { type: String, required: true, trim: true, unique: true },
  barcode: { type: String, trim: true },
  category: { type: String, default: 'Général' },
  price: { type: Number, required: true, min: 0 }, // Prix de vente (DH)
  costPrice: { type: Number, default: 0, min: 0 }, // Coût d'achat (DH)
  taxRate: { type: Number, default: 20 }, // TVA 20%
  stock: { type: Number, default: 0 }, // Quantité disponible
  minStockAlert: { type: Number, default: 5 }, // Seuil d'alerte
  unit: { type: String, default: 'Unités' },
  imageUrl: { type: String, default: '' },
  isPosAvailable: { type: Boolean, default: true },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
