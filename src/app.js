const express = require('express');
const productRoutes = require('./routes/productRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.get('/', (req, res) => res.json({
	message: 'Inventory API is running',
	endpoints: {
		health: '/health',
		products: '/api/products'
	}
}));
app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/products', productRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;