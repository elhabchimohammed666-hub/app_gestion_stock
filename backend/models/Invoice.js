const mongoose = require('mongoose');

const InvoiceItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  reference: { type: String, default: '' },
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, default: 20 },
  subtotal: { type: Number, required: true },
  taxAmount: { type: Number, default: 0 },
  total: { type: Number, required: true }
});

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['client', 'fournisseur', 'avoir'], 
    default: 'client' 
  },
  contact: { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', required: true },
  contactName: { type: String, required: true },
  date: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  salesperson: { type: String, default: 'Administrateur' },
  items: [InvoiceItemSchema],
  subtotal: { type: Number, required: true, default: 0 }, // HT
  taxAmount: { type: Number, required: true, default: 0 }, // TVA
  totalAmount: { type: Number, required: true, default: 0 }, // TTC en DH
  amountPaid: { type: Number, default: 0 },
  status: { 
    type: String, 
    enum: ['brouillon', 'comptabilise', 'annule'], 
    default: 'brouillon' 
  },
  paymentStatus: { 
    type: String, 
    enum: ['non_paye', 'partiel', 'paye'], 
    default: 'non_paye' 
  },
  paymentMethod: { type: String, default: 'Virement bancaire' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Invoice', InvoiceSchema);
