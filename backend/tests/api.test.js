// Set environment to test
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/fashion-ecommerce-test';

const request = require('supertest');
const mongoose = require('mongoose');
const { app, server } = require('../server');
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

describe('API Integration Tests', () => {
  let testUserToken = '';
  let categoryId = '';
  let productId = '';

  beforeAll(async () => {
    // Clear test collections
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Seed dummy category
    const cat = await Category.create({
      name: 'Testing Category',
      description: 'Used for integration test suites',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30',
    });
    categoryId = cat._id;

    // Seed dummy product
    const prod = await Product.create({
      name: 'Testing T-Shirt',
      description: 'Test descriptions details',
      brand: 'TestBrand',
      price: 25.00,
      stock: 10,
      images: ['https://images.unsplash.com/photo-1521572267360-ee0c2909d518'],
      category: categoryId,
    });
    productId = prod._id;
  });

  afterAll(async () => {
    // Clear test collections and close connection
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
    if (server && typeof server.close === 'function') {
      await server.close();
    }
  });

  // 1. Health API Test
  describe('GET /api/health', () => {
    it('should return 200 OK with test environment info', async () => {
      const res = await request(app).get('/api/health');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('environment', 'test');
    });
  });

  // 2. Registration API Test
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: 'testuser@example.com',
          password: 'password123',
          phone: '+15551234',
          address: '789 Testing Lane, City, TestLand',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.email).toBe('testuser@example.com');
      testUserToken = res.body.token;
    });

    it('should return 400 if user email is registered twice', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Integration Test User',
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('message');
    });
  });

  // 3. Login API Test
  describe('POST /api/auth/login', () => {
    it('should authenticate user and return token', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should return 401 for incorrect passwords', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'testuser@example.com',
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(401);
    });
  });

  // 4. Products API Test
  describe('GET /api/products', () => {
    it('should return a list of seeded products', async () => {
      const res = await request(app).get('/api/products');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('products');
      expect(Array.isArray(res.body.products)).toBe(true);
      expect(res.body.products.length).toBeGreaterThan(0);
    });
  });

  // 5. Protected profile test
  describe('GET /api/auth/me', () => {
    it('should return profile information if valid token is provided', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.email).toBe('testuser@example.com');
    });

    it('should return 401 if token is not sent', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });
  });

  // 6. Reseed Database Test
  describe('POST /api/products/reseed', () => {
    it('should successfully clear and reseed the database from DummyJSON API', async () => {
      const res = await request(app).post('/api/products/reseed');
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('success', true);
      expect(res.body.data).toHaveProperty('productsSeededCount', 100);
    });
  });
});
