const express = require('express');
const router = express.Router();
const StockOperation = require('../models/StockOperation');
const StockMovement = require('../models/StockMovement');
const Product = require('../models/Product');
const Contact = require('../models/Contact');

// GET inventory dashboard statistics (matching Odoo kanban cards in the video!)
router.get('/dashboard', async (req, res) => {
  try {
    const receptionsCount = await StockOperation.countDocuments({ type: 'reception', status: { $in: ['brouillon', 'pret'] } });
    const receptionsDone = await StockOperation.countDocuments({ type: 'reception', status: 'fait' });

    const livraisonsCount = await StockOperation.countDocuments({ type: 'livraison', status: { $in: ['brouillon', 'pret'] } });
    const livraisonsDone = await StockOperation.countDocuments({ type: 'livraison', status: 'fait' });

    const transfertsCount = await StockOperation.countDocuments({ type: 'transfert', status: { $in: ['brouillon', 'pret'] } });
    const transfertsDone = await StockOperation.countDocuments({ type: 'transfert', status: 'fait' });

    const lowStockCount = await Product.countDocuments({
      active: true,
      $expr: { $lte: ['$stock', '$minStockAlert'] }
    });

    const totalProducts = await Product.countDocuments({ active: true });

    res.json({
      receptions: { toProcess: receptionsCount, done: receptionsDone },
      livraisons: { toProcess: livraisonsCount, done: livraisonsDone },
      transferts: { toProcess: transfertsCount, done: transfertsDone },
      lowStockCount,
      totalProducts
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET all stock operations
router.get('/operations', async (req, res) => {
  try {
    const { type, status, search } = req.query;
    let query = {};

    if (type) query.type = type;
    if (status) query.status = status;

    if (search) {
      query.$or = [
        { reference: { $regex: search, $options: 'i' } },
        { partnerName: { $regex: search, $options: 'i' } },
        { sourceDocument: { $regex: search, $options: 'i' } }
      ];
    }

    const operations = await StockOperation.find(query).sort({ date: -1 });
    res.json(operations);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// Helper for next operation reference
const getNextOpReference = async (type) => {
  const year = new Date().getFullYear();
  let prefix = 'WH/IN';
  if (type === 'livraison') prefix = 'WH/OUT';
  else if (type === 'transfert') prefix = 'WH/INT';
  else if (type === 'ajustement') prefix = 'WH/ADJ';

  const regex = new RegExp(`^${prefix}/${year}/`);
  const lastOp = await StockOperation.findOne({ reference: regex }).sort({ createdAt: -1 });
  let nextSeq = 1;
  if (lastOp && lastOp.reference) {
    const parts = lastOp.reference.split('/');
    if (parts.length === 3) {
      nextSeq = parseInt(parts[2], 10) + 1;
    }
  }
  return `${prefix}/${year}/${String(nextSeq).padStart(5, '0')}`;
};

// POST create stock operation
router.post('/operations', async (req, res) => {
  try {
    const { type, partnerId, sourceLocation, destinationLocation, sourceDocument, items, notes } = req.body;

    let partnerName = '';
    if (partnerId) {
      const partner = await Contact.findById(partnerId);
      if (partner) partnerName = partner.name;
    }

    const reference = await getNextOpReference(type);

    const processedItems = items.map(item => ({
      product: item.productId,
      productName: item.productName,
      demandedQuantity: Number(item.demandedQuantity),
      doneQuantity: Number(item.doneQuantity !== undefined ? item.doneQuantity : item.demandedQuantity)
    }));

    const operation = new StockOperation({
      reference,
      type,
      partner: partnerId || null,
      partnerName,
      sourceLocation: sourceLocation || (type === 'reception' ? 'Fournisseurs' : 'WH/Stock'),
      destinationLocation: destinationLocation || (type === 'livraison' ? 'Clients' : 'WH/Stock'),
      sourceDocument: sourceDocument || '',
      items: processedItems,
      status: 'pret',
      notes: notes || ''
    });

    await operation.save();
    res.status(201).json(operation);
  } catch (error) {
    res.status(400).json({ message: 'Erreur création opération', error: error.message });
  }
});

// PUT validate operation (AUTOMATIC STOCK UPDATE)
router.put('/operations/:id/validate', async (req, res) => {
  try {
    const operation = await StockOperation.findById(req.params.id);
    if (!operation) return res.status(404).json({ message: 'Opération non trouvée' });

    if (operation.status === 'fait') {
      return res.status(400).json({ message: 'Opération déjà validée' });
    }

    for (const item of operation.items) {
      const product = await Product.findById(item.product);
      if (!product) continue;

      const prevStock = product.stock;
      let qtyChange = 0;

      if (operation.type === 'reception') {
        qtyChange = item.doneQuantity;
        product.stock += qtyChange;
      } else if (operation.type === 'livraison') {
        qtyChange = -item.doneQuantity;
        product.stock = Math.max(0, product.stock - item.doneQuantity);
      }

      await product.save();

      // Log movement
      await StockMovement.create({
        product: product._id,
        productName: product.name,
        operationType: operation.type,
        referenceDoc: operation.reference,
        quantityChanged: qtyChange,
        previousStock: prevStock,
        newStock: product.stock,
        location: operation.type === 'reception' ? operation.destinationLocation : operation.sourceLocation,
        user: 'Administrateur'
      });
    }

    operation.status = 'fait';
    await operation.save();

    res.json({ message: 'Opération validée et stock synchronisé!', operation });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la validation', error: error.message });
  }
});

// GET all stock movements
router.get('/movements', async (req, res) => {
  try {
    const { productId, search } = req.query;
    let query = {};

    if (productId) query.product = productId;
    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { referenceDoc: { $regex: search, $options: 'i' } }
      ];
    }

    const movements = await StockMovement.find(query).sort({ date: -1 }).limit(100);
    res.json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
