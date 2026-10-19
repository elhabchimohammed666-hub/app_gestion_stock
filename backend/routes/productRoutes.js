const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// GET all products
router.get('/', async (req, res) => {
  try {
    const { category, search, lowStock, posOnly } = req.query;
    let query = { active: true };

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

    if (lowStock === 'true') {
      query.$expr = { $lte: ['$stock', '$minStockAlert'] };
    }

    if (posOnly === 'true') {
      query.isPosAvailable = true;
    }

    const products = await Product.find(query).sort({ updatedAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category', { active: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// GET single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

// POST create product
router.post('/', async (req, res) => {
  try {
    const { name, reference, barcode, category, price, costPrice, taxRate, stock, minStockAlert, unit, imageUrl } = req.body;

    const existing = await Product.findOne({ reference });
    if (existing) {
      return res.status(400).json({ message: 'Cette référence produit existe déjà' });
    }

    const product = new Product({
      name,
      reference,
      barcode: barcode || reference,
      category: category || 'Général',
      price: Number(price),
      costPrice: Number(costPrice || 0),
      taxRate: Number(taxRate || 20),
      stock: Number(stock || 0),
      minStockAlert: Number(minStockAlert || 5),
      unit: unit || 'Unités',
      imageUrl: imageUrl || ''
    });

    await product.save();

    if (product.stock > 0) {
      await StockMovement.create({
        product: product._id,
        productName: product.name,
        operationType: 'ajustement',
        referenceDoc: 'INIT-STOCK',
        quantityChanged: product.stock,
        previousStock: 0,
        newStock: product.stock,
        location: 'WH/Stock'
      });
    }

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error: error.message });
  }
});

// PUT update product
router.put('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });

    const prevStock = product.stock;
    Object.assign(product, req.body);
    await product.save();

    if (req.body.stock !== undefined && Number(req.body.stock) !== prevStock) {
      const diff = Number(req.body.stock) - prevStock;
      await StockMovement.create({
        product: product._id,
        productName: product.name,
        operationType: 'ajustement',
        referenceDoc: 'MANUAL-ADJ',
        quantityChanged: diff,
        previousStock: prevStock,
        newStock: product.stock,
        location: 'WH/Stock'
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
});

// DELETE product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { active: false }, { new: true });
    if (!product) return res.status(404).json({ message: 'Produit non trouvé' });
    res.json({ message: 'Produit archivé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
