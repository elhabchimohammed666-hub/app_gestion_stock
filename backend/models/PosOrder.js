const mongoose = require('mongoose');

const PosOrderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  productName: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  subtotal: { type: Number, required: true }
});

const PosOrderSchema = new mongoose.Schema({
  orderNumber: { type: String, required: true, unique: true }, // e.g. TICKET/001
  posSession: { type: mongoose.Schema.Types.ObjectId, ref: 'PosSession' },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact' },
  clientName: { type: String, default: 'Client Comptoir' },
  date: { type: Date, default: Date.now },
  items: [PosOrderItemSchema],
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true }, // en DH
  amountReceived: { type: Number, required: true },
  changeGiven: { type: Number, default: 0 },
  paymentMethod: { 
    type: String, 
    enum: ['Espèces', 'Carte bancaire', 'Virement / Chèque', 'Compte client'], 
    default: 'Espèces' 
  },
  cashier: { type: String, default: 'Administrateur' },
  status: { type: String, enum: ['paye', 'rembourse'], default: 'paye' }
}, { timestamps: true });

module.exports = mongoose.model('PosOrder', PosOrderSchema);
