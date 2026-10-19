const mongoose = require('mongoose');

const ContactSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  type: { 
    type: String, 
    enum: ['client', 'fournisseur', 'both'], 
    default: 'client' 
  },
  isCompany: { type: Boolean, default: true },
  email: { type: String, trim: true, default: '' },
  phone: { type: String, trim: true, default: '' },
  address: { type: String, trim: true, default: '' },
  city: { type: String, trim: true, default: 'Casablanca' },
  ice: { type: String, trim: true, default: '' }, // Identifiant Commun de l'Entreprise (Maroc)
  if: { type: String, trim: true, default: '' },  // Identifiant Fiscal
  rc: { type: String, trim: true, default: '' },  // Registre de Commerce
  totalDue: { type: Number, default: 0 },
  avatar: { type: String, default: '' },
  notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Contact', ContactSchema);
