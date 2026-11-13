const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, minlength: 2, maxlength: 120 },
  sku: { type: String, required: [true, 'SKU is required'], unique: true, trim: true, uppercase: true, match: [/^[A-Z0-9-]+$/, 'SKU may contain only letters, numbers, and hyphens'] },
  category: { type: String, required: [true, 'Category is required'], trim: true, maxlength: 60 },
  price: { type: Number, required: [true, 'Price is required'], min: [0, 'Price cannot be negative'] },
  quantity: { type: Number, required: [true, 'Quantity is required'], min: 0, validate: { validator: Number.isInteger, message: 'Quantity must be a whole number' } },
  reorderLevel: { type: Number, required: [true, 'Reorder level is required'], min: 0, validate: { validator: Number.isInteger, message: 'Reorder level must be a whole number' } },
  supplier: { type: String, required: [true, 'Supplier is required'], trim: true, maxlength: 120 }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

productSchema.virtual('stockValue').get(function getStockValue() {
  return this.price * this.quantity;
});

module.exports = mongoose.model('Product', productSchema);