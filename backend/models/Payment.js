const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  paymentNumber: { type: String, required: true, unique: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  contactName: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['inbound', 'outbound'], 
    default: 'inbound' 
  },
  paymentMethod: { 
    type: String, 
    enum: ['Espèces', 'Virement bancaire', 'Chèque', 'Carte bancaire'], 
    default: 'Espèces' 
  },
  amount: { type: Number, required: true, min: 0 },
  paymentDate: { type: Date, default: Date.now },
  reference: { type: String, default: '' },
  journal: { type: String, default: 'Banque' }, // Banque / Caisse
  status: { 
    type: String, 
    enum: ['valide', 'annule'], 
    default: 'valide' 
  },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
