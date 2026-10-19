const express = require('express');
const router = express.Router();
const Payment = require('../models/Payment');

// GET all payments
router.get('/', async (req, res) => {
  try {
    const { type, search } = req.query;
    let query = {};

    if (type) query.type = type;

    if (search) {
      query.$or = [
        { paymentNumber: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } }
      ];
    }

    const payments = await Payment.find(query).sort({ paymentDate: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
