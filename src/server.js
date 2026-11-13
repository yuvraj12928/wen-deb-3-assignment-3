require('dotenv').config();

const app = require('./app');
const connectDatabase = require('./config/db');
const port = process.env.PORT || 5000;

const server = app.listen(port, () => console.log(`Server running on port ${port}`));

connectDatabase().catch((error) => {
  console.error(`Database connection failed: ${error.message}`);
  console.error('Start MongoDB and restart the API to enable product operations.');
});

function closeServer() {
  server.close(() => process.exit(0));
}

process.on('SIGINT', closeServer);
process.on('SIGTERM', closeServer);