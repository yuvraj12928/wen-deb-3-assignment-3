const express = require('express');
const mongoose = require('mongoose');
const Product = require('../models/Product');

const router = express.Router();
const sortableFields = new Set(['name', 'sku', 'category', 'price', 'quantity', 'reorderLevel', 'createdAt']);
const editableFields = ['name', 'category', 'price', 'quantity', 'reorderLevel', 'supplier'];

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parsePositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function validId(id) {
  return mongoose.isValidObjectId(id);
}

router.post('/', async (req, res, next) => {
  try {
    res.status(201).json(await Product.create(req.body));
  } catch (error) { next(error); }
});

router.get('/', async (req, res, next) => {
  try {
    const page = parsePositiveInteger(req.query.page, 1);
    const limit = Math.min(parsePositiveInteger(req.query.limit, 10), 100);
    const filter = {};
    if (req.query.category) filter.category = new RegExp(`^${escapeRegex(req.query.category)}$`, 'i');
    if (req.query.search) {
      const search = new RegExp(escapeRegex(req.query.search), 'i');
      filter.$or = [{ name: search }, { sku: search }];
    }
    if (req.query.minPrice || req.query.maxPrice) filter.price = {};
    if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    if (req.query.lowStock === 'true') filter.$expr = { $lte: ['$quantity', '$reorderLevel'] };

    const requestedSort = String(req.query.sort || '-createdAt');
    const sortField = requestedSort.replace(/^-/, '');
    const sort = sortableFields.has(sortField) ? requestedSort : '-createdAt';
    const [products, total] = await Promise.all([
      Product.find(filter).sort(sort).skip((page - 1) * limit).limit(limit),
      Product.countDocuments(filter)
    ]);
    res.json({ total, page, totalPages: Math.ceil(total / limit), count: products.length, products });
  } catch (error) { next(error); }
});

router.get('/low-stock', async (req, res, next) => {
  try {
    const lowStockItems = await Product.find({ $expr: { $lte: ['$quantity', '$reorderLevel'] } }).sort({ quantity: 1 });
    res.json({ count: lowStockItems.length, lowStockItems });
  } catch (error) { next(error); }
});

router.get('/summary', async (req, res, next) => {
  try {
    const summary = await Product.aggregate([
      { $group: { _id: '$category', totalItems: { $sum: 1 }, totalQuantity: { $sum: '$quantity' }, totalStockValue: { $sum: { $multiply: ['$price', '$quantity'] } }, avgPrice: { $avg: '$price' } } },
      { $sort: { _id: 1 } }
    ]);
    res.json({ categories: summary.length, summary });
  } catch (error) { next(error); }
});

router.get('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) { next(error); }
});

router.put('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
    const updates = Object.fromEntries(editableFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]]));
    const product = await Product.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) { next(error); }
});

router.patch('/:id/stock', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
    const change = Number(req.body.change);
    if (!Number.isInteger(change) || change === 0) return res.status(400).json({ message: 'change must be a non-zero whole number' });
    const query = { _id: req.params.id };
    if (change < 0) query.quantity = { $gte: Math.abs(change) };
    const product = await Product.findOneAndUpdate(query, { $inc: { quantity: change } }, { new: true, runValidators: true });
    if (!product) return res.status(400).json({ message: change < 0 ? 'Insufficient stock or product not found' : 'Product not found' });
    res.json({ message: 'Stock updated', product });
  } catch (error) { next(error); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    if (!validId(req.params.id)) return res.status(400).json({ message: 'Invalid product ID' });
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted', id: product._id });
  } catch (error) { next(error); }
});

module.exports = router;