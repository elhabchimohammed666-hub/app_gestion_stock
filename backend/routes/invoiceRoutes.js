const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const Payment = require('../models/Payment');
const StockMovement = require('../models/StockMovement');

// GET all invoices
router.get('/', async (req, res) => {
  try {
    const { type, status, paymentStatus, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: 'i' } },
        { contactName: { $regex: search, $options: 'i' } },
        { salesperson: { $regex: search, $options: 'i' } }
      ];
    }

    const invoices = await Invoice.find(query).sort({ date: -1 });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET single invoice
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('contact');
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });

    const payments = await Payment.find({ invoice: invoice._id }).sort({ paymentDate: -1 });
    res.json({ invoice, payments });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Helper function to generate next invoice number
const getNextInvoiceNumber = async (type) => {
  const year = new Date().getFullYear();
  const prefix = type === 'client' ? 'FACT' : (type === 'fournisseur' ? 'FAC-FOUR' : 'AVOIR');
  const regex = new RegExp(`^${prefix}/${year}/`);
  
  const lastInvoice = await Invoice.findOne({ invoiceNumber: regex }).sort({ createdAt: -1 });
  let nextSeq = 1;
  if (lastInvoice && lastInvoice.invoiceNumber) {
    const parts = lastInvoice.invoiceNumber.split('/');
    if (parts.length === 3) {
      nextSeq = parseInt(parts[2], 10) + 1;
    }
  }
  return `${prefix}/${year}/${String(nextSeq).padStart(5, '0')}`;
};

// POST create invoice
router.post('/', async (req, res) => {
  try {
    const { type, contactId, dueDate, salesperson, items, notes } = req.body;

    const contact = await Contact.findById(contactId);
    if (!contact) return res.status(404).json({ message: 'Contact non trouvé' });

    const invoiceNumber = await getNextInvoiceNumber(type || 'client');

    let subtotal = 0;
    let taxAmount = 0;

    const processedItems = items.map(item => {
      const lineSubtotal = Number(item.quantity) * Number(item.unitPrice);
      const lineTaxRate = item.taxRate !== undefined ? Number(item.taxRate) : 20;
      const lineTax = (lineSubtotal * lineTaxRate) / 100;
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      taxAmount += lineTax;

      return {
        product: item.productId || null,
        reference: item.reference || '',
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        taxRate: lineTaxRate,
        subtotal: lineSubtotal,
        taxAmount: lineTax,
        total: lineTotal
      };
    });

    const totalAmount = subtotal + taxAmount;

    const invoice = new Invoice({
      invoiceNumber,
      type: type || 'client',
      contact: contact._id,
      contactName: contact.name,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      salesperson: salesperson || 'Administrateur',
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
      amountPaid: 0,
      status: 'brouillon',
      paymentStatus: 'non_paye',
      notes: notes || ''
    });

    await invoice.save();
    res.status(201).json(invoice);
  } catch (error) {
    res.status(400).json({ message: 'Erreur création facture', error: error.message });
  }
});

// PUT validate / comptabiliser invoice
router.put('/:id/validate', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });

    if (invoice.status === 'comptabilise') {
      return res.status(400).json({ message: 'Facture déjà comptabilisée' });
    }

    invoice.status = 'comptabilise';
    await invoice.save();

    // Mettre à jour le solde du client/fournisseur
    const contact = await Contact.findById(invoice.contact);
    if (contact) {
      if (invoice.type === 'client') {
        contact.totalDue = (contact.totalDue || 0) + (invoice.totalAmount - invoice.amountPaid);
      } else if (invoice.type === 'fournisseur') {
        contact.totalDue = (contact.totalDue || 0) - (invoice.totalAmount - invoice.amountPaid);
      }
      await contact.save();
    }

    res.json({ message: 'Facture comptabilisée avec succès', invoice });
  } catch (error) {
    res.status(500).json({ message: 'Erreur validation', error: error.message });
  }
});

// POST register payment for invoice
router.post('/:id/pay', async (req, res) => {
  try {
    const { amount, paymentMethod, paymentDate, reference, journal, notes } = req.body;
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });

    const paymentAmount = Number(amount);
    if (paymentAmount <= 0) {
      return res.status(400).json({ message: 'Le montant doit être supérieur à 0' });
    }

    const payCount = await Payment.countDocuments();
    const paymentNumber = `PAY/${new Date().getFullYear()}/${String(payCount + 1).padStart(5, '0')}`;

    const payment = new Payment({
      paymentNumber,
      invoice: invoice._id,
      contact: invoice.contact,
      contactName: invoice.contactName,
      type: invoice.type === 'client' ? 'inbound' : 'outbound',
      paymentMethod: paymentMethod || 'Espèces',
      amount: paymentAmount,
      paymentDate: paymentDate || new Date(),
      reference: reference || '',
      journal: journal || (paymentMethod === 'Espèces' ? 'Caisse' : 'Banque'),
      notes: notes || ''
    });

    await payment.save();

    invoice.amountPaid = (invoice.amountPaid || 0) + paymentAmount;
    if (invoice.amountPaid >= invoice.totalAmount - 0.01) {
      invoice.paymentStatus = 'paye';
    } else if (invoice.amountPaid > 0) {
      invoice.paymentStatus = 'partiel';
    }
    await invoice.save();

    // Mettre à jour le solde contact
    const contact = await Contact.findById(invoice.contact);
    if (contact) {
      if (invoice.type === 'client') {
        contact.totalDue = Math.max(0, (contact.totalDue || 0) - paymentAmount);
      } else {
        contact.totalDue = (contact.totalDue || 0) + paymentAmount;
      }
      await contact.save();
    }

    res.status(201).json({ message: 'Paiement enregistré avec succès', payment, invoice });
  } catch (error) {
    res.status(400).json({ message: 'Erreur enregistrement paiement', error: error.message });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);
    if (!invoice) return res.status(404).json({ message: 'Facture non trouvée' });

    if (invoice.status === 'comptabilise' && invoice.paymentStatus === 'paye') {
      return res.status(400).json({ message: 'Impossible de supprimer une facture payée et comptabilisée' });
    }

    await Invoice.findByIdAndDelete(req.params.id);
    res.json({ message: 'Facture supprimée' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
