const express = require('express');
const router = express.Router();
const PosSession = require('../models/PosSession');
const PosOrder = require('../models/PosOrder');
const Product = require('../models/Product');
const Contact = require('../models/Contact');
const StockMovement = require('../models/StockMovement');

// GET all POS sessions
router.get('/sessions', async (req, res) => {
  try {
    const sessions = await PosSession.find().sort({ updatedAt: -1 });
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST open new session
router.post('/sessions', async (req, res) => {
  try {
    const { name, openingCash, cashier } = req.body;
    const sessionCount = await PosSession.countDocuments();
    const sessionNumber = `POS/${new Date().getFullYear()}/${String(sessionCount + 1).padStart(3, '0')}`;

    const session = new PosSession({
      sessionNumber,
      name: name || `Caisse ${sessionCount + 1}`,
      cashier: cashier || 'Administrateur',
      openingCash: Number(openingCash || 500),
      status: 'en_cours'
    });

    await session.save();
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: 'Erreur ouverture session', error: error.message });
  }
});

// PUT close session
router.put('/sessions/:id/close', async (req, res) => {
  try {
    const { closingCash } = req.body;
    const session = await PosSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: 'Session non trouvée' });

    session.status = 'fermee';
    session.closingDate = new Date();
    session.closingCash = Number(closingCash || (session.openingCash + session.totalSales));

    await session.save();
    res.json(session);
  } catch (error) {
    res.status(500).json({ message: 'Erreur fermeture session', error: error.message });
  }
});

// GET products for POS terminal
router.get('/products', async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = { active: true, isPosAvailable: true };

    if (category && category !== 'Tous') {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { reference: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ name: 1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Helper for next POS ticket number
const getNextOrderNumber = async () => {
  const count = await PosOrder.countDocuments();
  return `TICK-${String(count + 1).padStart(4, '0')}`;
};

// POST create POS order (checkout)
router.post('/orders', async (req, res) => {
  try {
    const { sessionId, clientId, items, amountReceived, paymentMethod, cashier } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Le panier est vide' });
    }

    let clientName = 'Client Comptoir';
    if (clientId) {
      const client = await Contact.findById(clientId);
      if (client) clientName = client.name;
    }

    let subtotal = 0;
    let taxAmount = 0;
    const processedItems = [];

    // Calculate totals and verify items
    for (const item of items) {
      const lineSub = Number(item.quantity) * Number(item.unitPrice) * (1 - (Number(item.discount || 0) / 100));
      subtotal += lineSub;
      processedItems.push({
        product: item.productId,
        productName: item.productName,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        discount: Number(item.discount || 0),
        subtotal: lineSub
      });
    }

    const total = subtotal; // TTC
    const received = Number(amountReceived);
    const change = Math.max(0, received - total);

    const orderNumber = await getNextOrderNumber();

    const order = new PosOrder({
      orderNumber,
      posSession: sessionId || null,
      client: clientId || null,
      clientName,
      items: processedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100,
      amountReceived: received,
      changeGiven: Math.round(change * 100) / 100,
      paymentMethod: paymentMethod || 'Espèces',
      cashier: cashier || 'Administrateur',
      status: 'paye'
    });

    await order.save();

    // Update product stock immediately and log movement
    for (const item of processedItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stock;
        product.stock = Math.max(0, product.stock - item.quantity);
        await product.save();

        await StockMovement.create({
          product: product._id,
          productName: product.name,
          operationType: 'vente_pos',
          referenceDoc: orderNumber,
          quantityChanged: -item.quantity,
          previousStock: prevStock,
          newStock: product.stock,
          location: 'Caisse / POS'
        });
      }
    }

    // Update session sales if sessionId is provided
    if (sessionId) {
      const session = await PosSession.findById(sessionId);
      if (session) {
        session.totalSales += total;
        session.ordersCount += 1;
        await session.save();
      }
    }

    res.status(201).json({ message: 'Commande POS validée avec succès!', order });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la validation de la commande', error: error.message });
  }
});

// GET recent POS orders
router.get('/orders', async (req, res) => {
  try {
    const { sessionId, limit } = req.query;
    let query = {};
    if (sessionId) query.posSession = sessionId;

    const orders = await PosOrder.find(query).sort({ date: -1 }).limit(Number(limit) || 50);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
