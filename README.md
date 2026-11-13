# Inventory and Data Management System

RESTful backend for Assignment 3 using Node.js, Express, MongoDB, Mongoose, and dotenv.

## Setup

```bash
npm install
cp .env.example .env
npm start
```

Start MongoDB first and update `MONGODB_URI` in `.env` if needed. The API runs on `http://localhost:5001` by default.

## Endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Health check |
| `POST` | `/api/products` | Create a product |
| `GET` | `/api/products` | List products |
| `GET` | `/api/products/:id` | Get one product |
| `PUT` | `/api/products/:id` | Update product details |
| `PATCH` | `/api/products/:id/stock` | Add or remove stock |
| `DELETE` | `/api/products/:id` | Delete a product |
| `GET` | `/api/products/low-stock` | Low-stock report |
| `GET` | `/api/products/summary` | Category aggregation summary |

The list endpoint supports `search`, `category`, `minPrice`, `maxPrice`, `lowStock=true`, `sort`, `page`, and `limit`. Sort fields include `name`, `sku`, `category`, `price`, `quantity`, `reorderLevel`, and `createdAt`; prefix a field with `-` for descending order.

### Create product body

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

Send `{ "change": 10 }` to restock or `{ "change": -5 }` for a sale. Stock cannot become negative.