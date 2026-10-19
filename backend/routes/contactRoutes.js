const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const Invoice = require('../models/Invoice');

// GET all contacts
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = {};

    if (type && type !== 'all') {
      query.type = { $in: [type, 'both'] };
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { ice: { $regex: search, $options: 'i' } }
      ];
    }

    const contacts = await Contact.find(query).sort({ name: 1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET contact by id with stats
router.get('/:id', async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });

    const invoices = await Invoice.find({ contact: contact._id }).sort({ date: -1 });
    res.json({ contact, invoices });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST create contact
router.post('/', async (req, res) => {
  try {
    const { name, type, isCompany, email, phone, address, city, ice, if: ifCode, rc, notes } = req.body;
    const contact = new Contact({
      name,
      type: type || 'client',
      isCompany: isCompany !== undefined ? isCompany : true,
      email: email || '',
      phone: phone || '',
      address: address || '',
      city: city || 'Casablanca',
      ice: ice || '',
      if: ifCode || '',
      rc: rc || '',
      notes: notes || ''
    });

    await contact.save();
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// PUT update contact
router.put('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la modification', error: error.message });
  }
});

// DELETE contact
router.delete('/:id', async (req, res) => {
  try {
    const contact = await Contact.findByIdAndDelete(req.params.id);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });
    res.json({ message: 'Contact supprimé' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
