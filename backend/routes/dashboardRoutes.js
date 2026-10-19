const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const PosOrder = require('../models/PosOrder');
const StockOperation = require('../models/StockOperation');
const Payment = require('../models/Payment');

router.get('/stats', async (req, res) => {
  try {
    // Total sales from invoices
    const validatedInvoices = await Invoice.find({ type: 'client', status: 'comptabilise' });
    const totalInvoiceSales = validatedInvoices.reduce((acc, inv) => acc + (inv.totalAmount || 0), 0);
    const totalCollected = validatedInvoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    const totalDue = totalInvoiceSales - totalCollected;

    // POS sales
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const posOrdersToday = await PosOrder.find({ date: { $gte: today } });
    const posTodaySales = posOrdersToday.reduce((acc, order) => acc + (order.total || 0), 0);

    const totalPosOrders = await PosOrder.countDocuments();
    const totalPosSales = (await PosOrder.aggregate([{ $group: { _id: null, total: { $sum: '$total' } } }]))[0]?.total || 0;

    // Inventory metrics
    const totalProducts = await Product.countDocuments({ active: true });
    const lowStockCount = await Product.countDocuments({
      active: true,
      $expr: { $lte: ['$stock', '$minStockAlert'] }
    });

    const pendingReceptions = await StockOperation.countDocuments({ type: 'reception', status: { $in: ['brouillon', 'pret'] } });
    const pendingDeliveries = await StockOperation.countDocuments({ type: 'livraison', status: { $in: ['brouillon', 'pret'] } });

    // Recent invoices
    const recentInvoices = await Invoice.find().sort({ date: -1 }).limit(5);

    // Recent POS orders
    const recentPosOrders = await PosOrder.find().sort({ date: -1 }).limit(5);

    res.json({
      totalInvoiceSales,
      totalCollected,
      totalDue,
      posTodaySales,
      totalPosSales,
      totalPosOrders,
      totalProducts,
      lowStockCount,
      pendingReceptions,
      pendingDeliveries,
      recentInvoices,
      recentPosOrders
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
});

module.exports = router;
