const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, unique: true },
  icon: { type: String, default: 'Package' },
  color: { type: String, default: '#714B67' }
}, { timestamps: true });

module.exports = mongoose.model('Category', CategorySchema);
