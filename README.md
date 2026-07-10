# Full Stack Fashion E-Commerce Platform

A production-ready, fully responsive full-stack fashion marketplace application (similar to Myntra/Ajio) built with React, Node.js, Express, and MongoDB.

---

## Features

### Customer Features
- **Authentication:** Registration, Login, and Profile Management (password reset, address updates).
- **Product Catalog:** Text search, filters (categories, brands, sizes, price range, ratings, featured), sorting (newest, price ascending/descending, rating), and pagination.
- **Wishlist:** Saved products list (persisted inside user schema).
- **Cart System:** Persistent database-backed shopping cart. Add items, edit quantity levels, remove items, and validate promo discount coupons.
- **Checkout Flow:** Compliance address inputs, Card / Cash-on-Delivery payment simulations, stock reductions, and cart clears.
- **Order Tracking:** Detailed purchase logs and tracking states (Placed &rarr; Processing &rarr; Shipped &rarr; Delivered &rarr; Cancelled).
- **Review System:** Star rating aggregates and comments submission per product.

### Admin Features
- **Admin Dashboard:** Access analytics metrics (total revenue, orders, customers, and active products) and custom SVG trends charts.
- **Product Management:** Complete list of products with popups to create, edit, or delete items.
- **Category Management:** Control category names, description sheets, and banner graphics.
- **Order Control:** View all transactions and update tracking states via dropdown selections.
- **User Ledger:** List of all accounts and privilege levels.

---

## Tech Stack

- **Frontend:** React (Vite), React Router DOM, Tailwind CSS (v3.4), Axios, React Hook Form
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas, Mongoose ODM
- **Authentication:** JWT, bcryptjs password hashing
- **Security:** Helmet, Express Rate Limiter, CORS, Input Validation
- **Testing:** Jest, Supertest
- **Containerization:** Docker, Docker Compose

---

## Installation & Setup

Ensure you have **Node.js** (v18+) and **MongoDB** installed and running locally.

### 1. Clone & Install Dependencies
Run the install command at the root directory. This will automatically execute `npm install` in the `backend/` and `frontend/` directories:
```bash
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/fashion-ecommerce
JWT_SECRET=supersecretjwtkey123!@#
JWT_EXPIRE=30d
NODE_ENV=development
```

### 3. Run the Database Seeding Script
Populate the local database with mock products fetched from the public [DummyJSON API](https://dummyjson.com/products?limit=100), along with categories, coupons, 1 admin account, and 2 customer accounts:
```bash
npm run seed
```

### 4. Start Local Development Server
Launches the Express API server (on port 5000) and the Vite React development server (on port 3000) concurrently:
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## Running with Docker

You can spin up the entire stack (Database, API, and Web App) using Docker Compose:
```bash
docker-compose up --build
```
This maps the React app to port 3000 and the Express API to port 5000.

---

## Test Execution

Run the backend integration tests (health check, user auth controllers, products catalog queries) using Jest:
```bash
npm test
```

---

## Demo Credentials

### Administrator
- **Email:** `admin@example.com`
- **Password:** `password123`

### Normal Customer
- **Email:** `user@example.com`
- **Password:** `password123`

---

## API Documentation

### Auth
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Authenticate credentials & return token
- `GET /api/auth/me` - Get current profile info (authed)
- `PUT /api/auth/profile` - Update profile settings (authed)
- `GET /api/auth/users` - List all users (admin only)

### Products

> [!NOTE]
> The product catalog is seeded from the public [DummyJSON API](https://dummyjson.com/products) and populated into the local MongoDB database.

#### 1. Retrieve Product List
- **Endpoint:** `GET /api/products`
- **Description:** Retrieve a paginated list of products with optional search, sorting, and filtering options.
- **Query Parameters:**
  | Parameter | Type | Description |
  | :--- | :--- | :--- |
  | `keyword` | String | Searches by product name, brand, description, or matching category synonyms. |
  | `category` | String | Comma-separated list of category database IDs (e.g. `65f123...,65f456...`). |
  | `brand` | String | Comma-separated list of brand names (e.g. `Nike,Adidas`). |
  | `minPrice` | Number | Filter products with price greater than or equal to this value. |
  | `maxPrice` | Number | Filter products with price less than or equal to this value. |
  | `size` | String | Comma-separated list of sizes (e.g. `S,M,L,XL`). |
  | `rating` | Number | Filter products with rating greater than or equal to this value (1-5). |
  | `featured` | Boolean | Filter by featured products (`true` or `false`). |
  | `sort` | String | Sort order: `newest` (default), `priceAsc`, `priceDesc`, or `rating`. |
  | `page` | Number | Page number for pagination (default: `1`). |
  | `limit` | Number | Number of products to return per page (default: `12`). |

- **Sample Response (Success 200 OK):**
  ```json
  {
    "products": [
      {
        "_id": "65f123abc456def789012345",
        "name": "Classic Denim Jacket",
        "description": "Premium quality denim jacket with standard fit.",
        "brand": "Levis",
        "price": 89.99,
        "discountPrice": 79.99,
        "stock": 45,
        "images": ["https://example.com/images/denim1.jpg"],
        "sizes": ["S", "M", "L"],
        "colors": ["Blue"],
        "rating": 4.5,
        "numReviews": 12,
        "featured": true,
        "category": {
          "_id": "65f122efc456def789012000",
          "name": "Men's Clothing"
        },
        "createdAt": "2026-03-15T10:00:00.000Z",
        "updatedAt": "2026-03-15T10:00:00.000Z"
      }
    ],
    "page": 1,
    "pages": 4,
    "totalProducts": 32
  }
  ```

#### 2. Fetch Single Product
- **Endpoint:** `GET /api/products/:id`
- **Description:** Retrieve detailed information of a single product by its MongoDB ObjectID.
- **Parameters:**
  - `id` (path parameter) - The ObjectID of the product.
- **Sample Response (Success 200 OK):**
  ```json
  {
    "_id": "65f123abc456def789012345",
    "name": "Classic Denim Jacket",
    "description": "Premium quality denim jacket with standard fit.",
    "brand": "Levis",
    "price": 89.99,
    "discountPrice": 79.99,
    "stock": 45,
    "images": ["https://example.com/images/denim1.jpg"],
    "sizes": ["S", "M", "L"],
    "colors": ["Blue"],
    "rating": 4.5,
    "numReviews": 12,
    "featured": true,
    "category": {
      "_id": "65f122efc456def789012000",
      "name": "Men's Clothing"
    },
    "createdAt": "2026-03-15T10:00:00.000Z",
    "updatedAt": "2026-03-15T10:00:00.000Z"
  }
  ```

#### 3. Client Integration Examples
Here is how you can perform product queries in your client applications:

##### Using Axios (React / Frontend)
```javascript
import axios from 'axios';

const fetchProducts = async () => {
  try {
    const response = await axios.get('/api/products', {
      params: {
        keyword: 'denim',
        category: '65f122efc456def789012000',
        minPrice: 50,
        maxPrice: 150,
        size: 'M,L',
        sort: 'priceAsc',
        page: 1,
        limit: 8
      }
    });
    
    const { products, page, pages, totalProducts } = response.data;
    console.log(`Fetched ${products.length} of ${totalProducts} products:`, products);
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};
```

##### Using Native Fetch API
```javascript
const getProducts = async () => {
  const url = new URL('http://localhost:5000/api/products');
  const params = {
    keyword: 'denim',
    sort: 'newest',
    page: '1',
    limit: '12'
  };
  
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Network response was not ok');
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Fetch operation failed:', error);
  }
};
```

#### 4. Write/Modify Product Endpoints (Admin Privileges Required)
- `POST /api/products` - Add product (admin only)
- `PUT /api/products/:id` - Edit product details (admin only)
- `DELETE /api/products/:id` - Remove product (admin only)

### Categories
- `GET /api/categories` - Fetch all categories
- `POST /api/categories` - Create new category (admin only)
- `PUT /api/categories/:id` - Edit category (admin only)
- `DELETE /api/categories/:id` - Remove category (admin only)

### Cart
- `GET /api/cart` - Fetch user's cart (authed)
- `POST /api/cart/add` - Add product size to cart (authed)
- `PUT /api/cart/update` - Edit item quantities (authed)
- `DELETE /api/cart/remove` - Delete item from cart (authed)

### Wishlist
- `GET /api/wishlist` - Fetch user's wishlist (authed)
- `POST /api/wishlist` - Add product to wishlist (authed)
- `DELETE /api/wishlist/:id` - Remove product from wishlist (authed)

### Orders
- `POST /api/orders` - Place a new order (authed)
- `GET /api/orders/my` - Fetch user's order history (authed)
- `GET /api/orders/all` - List all store orders (admin only)
- `GET /api/orders/dashboard/stats` - Fetch dashboard aggregated charts data (admin only)
- `GET /api/orders/:id` - Fetch order tracking details (authed/admin)
- `PUT /api/orders/:id/status` - Change tracking status (admin only)

### Coupons
- `POST /api/coupons/validate` - Check coupon validity (authed)
- `GET /api/coupons` - List all coupons (admin only)
- `POST /api/coupons` - Add coupon code (admin only)
- `DELETE /api/coupons/:id` - Delete coupon (admin only)

### Reviews
- `POST /api/reviews` - Submit product rating (authed)
- `GET /api/reviews/product/:productId` - Get reviews for a product

---

## Folder Structure

```text
├── Dockerfile.backend
├── Dockerfile.frontend
├── README.md
├── docker-compose.yml
├── package.json
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── tests/
│   └── utils/
└── frontend/
    ├── index.html
    ├── package.json
    ├── postcss.config.js
    ├── tailwind.config.js
    ├── vercel.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        ├── components/
        ├── context/
        ├── layouts/
        ├── pages/
        ├── services/
        └── routes/
```

---

## Known Limitations
- Payment is simulated on the frontend; no payment gateway (Stripe/PayPal) is integrated.
- Image uploads utilize mock URL input forms rather than Cloudinary API uploads.

