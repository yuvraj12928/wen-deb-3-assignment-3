function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

function errorHandler(error, req, res, next) {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Internal server error';
  if (error.name === 'ValidationError') {
    statusCode = 400;
    message = Object.values(error.errors).map((item) => item.message).join(', ');
  }
  if (error.name === 'CastError') { statusCode = 400; message = `Invalid ${error.path}`; }
  if (error.code === 11000) { statusCode = 409; message = 'A product with this SKU already exists'; }
  res.status(statusCode).json({ message });
}

module.exports = { notFound, errorHandler };