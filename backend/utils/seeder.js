const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');
const Review = require('../models/Review');
const Cart = require('../models/Cart');
const Order = require('../models/Order');

const couponsData = [
  {
    code: "WELCOME10",
    discountType: "percentage",
    discountAmount: 10,
    expiryDate: new Date('2028-12-31'),
    isActive: true
  },
  {
    code: "FASHION20",
    discountType: "percentage",
    discountAmount: 20,
    expiryDate: new Date('2028-12-31'),
    isActive: true
  },
  {
    code: "FLAT500",
    discountType: "fixed",
    discountAmount: 500,
    expiryDate: new Date('2028-12-31'),
    isActive: true
  }
];

const runSeeder = async () => {
  console.log("Clearing database collections...");
  await Product.deleteMany({});
  await Category.deleteMany({});
  await Coupon.deleteMany({});
  await User.deleteMany({});
  await Review.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  console.log("Fetching products from DummyJSON API...");
  const response = await fetch('https://dummyjson.com/products?limit=100');
  if (!response.ok) {
    throw new Error(`Failed to fetch DummyJSON products: ${response.statusText}`);
  }
  const resData = await response.json();
  const dummyProducts = resData.products;

  const categoryCache = {};
  const getOrCreateCategory = async (catName, firstProductImage) => {
    const displayName = catName
      .split('-')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');

    if (categoryCache[displayName]) {
      return categoryCache[displayName];
    }

    let category = await Category.findOne({ name: displayName });
    if (!category) {
      category = await Category.create({
        name: displayName,
        description: `Premium collection of ${displayName}`,
        image: firstProductImage || 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&auto=format&fit=crop&q=80',
      });
    }
    categoryCache[displayName] = category._id;
    return category._id;
  };

  const generatedSlugs = new Set();
  const generateUniqueSlug = (title) => {
    let baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');
    let slug = baseSlug;
    let counter = 1;
    while (generatedSlugs.has(slug)) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    generatedSlugs.add(slug);
    return slug;
  };

  const getINRPrice = (categoryName, usdPrice) => {
    const catLower = categoryName.toLowerCase();
    // 1. Sneakers / Shoes
    if (catLower.includes('shoe') || catLower.includes('sneaker') || catLower.includes('footwear')) {
      const ratio = Math.min(1, Math.max(0, (usdPrice - 10) / 200));
      return 1999 + Math.round(ratio * 3000);
    }
    // 2. Hoodies / Jackets
    if (catLower.includes('hoodie') || catLower.includes('jacket') || catLower.includes('outerwear')) {
      const ratio = Math.min(1, Math.max(0, (usdPrice - 20) / 250));
      return 999 + Math.round(ratio * 1500);
    }
    // 3. T-Shirts / Shirts / Tops
    if (catLower.includes('shirt') || catLower.includes('tshirt') || catLower.includes('top') || catLower.includes('clothing')) {
      const ratio = Math.min(1, Math.max(0, (usdPrice - 5) / 80));
      return 499 + Math.round(ratio * 800);
    }
    // 4. Accessories / Watches / Sunglasses / Bags
    if (catLower.includes('accessory') || catLower.includes('watch') || catLower.includes('bag') || catLower.includes('sunglass') || catLower.includes('jewel')) {
      const ratio = Math.min(1, Math.max(0, (usdPrice - 5) / 150));
      return 299 + Math.round(ratio * 1200);
    }
    
    // Fallback: convert directly by multiplying by 83
    return Math.round(usdPrice * 83);
  };

  const productsData = [];
  for (const item of dummyProducts) {
    const categoryId = await getOrCreateCategory(item.category, item.thumbnail);
    
    // Calculate INR Price
    const basePriceINR = getINRPrice(item.category, item.price);

    // Calculate discountPrice
    const discountPrice = item.discountPercentage 
      ? Math.round(basePriceINR * (1 - item.discountPercentage / 100))
      : 0;

    productsData.push({
      name: item.title,
      slug: generateUniqueSlug(item.title),
      description: item.description,
      brand: item.brand || 'Generic',
      price: basePriceINR,
      discountPrice: discountPrice,
      stock: item.stock || 20,
      images: item.images && item.images.length > 0 ? item.images : [item.thumbnail],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Black", "White", "Navy", "Gray"],
      rating: item.rating || 0,
      featured: item.rating >= 4.5,
      totalReviews: 0,
      category: categoryId,
    });
  }

  const createdProducts = await Product.insertMany(productsData);
  console.log(`Successfully seeded ${createdProducts.length} products.`);

  console.log("Seeding coupons...");
  await Coupon.insertMany(couponsData);

  console.log("Seeding users...");
  const admin = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
    phone: "+1234567890",
    address: "100 Admin HQ, Tech City, USA"
  });

  const user1 = await User.create({
    name: "John Doe",
    email: "user@example.com",
    password: "password123",
    role: "user",
    phone: "+1987654321",
    address: "456 Elm Street, Suburbia, USA"
  });

  const user2 = await User.create({
    name: "Jane Smith",
    email: "jane@example.com",
    password: "password123",
    role: "user",
    phone: "+1122334455",
    address: "789 Pine Lane, Metroville, USA"
  });

  console.log("Adding mock product reviews...");
  const firstProd = createdProducts[0];
  await Review.create({
    user: user1._id,
    product: firstProd._id,
    rating: 5,
    comment: "Absolutely perfect! Fabric is extremely soft and slim fit is spot on. Worth every penny."
  });

  await Review.create({
    user: user2._id,
    product: firstProd._id,
    rating: 4,
    comment: "Very nice shirt, fits well but needs iron after washing. Excellent Zara quality."
  });

  console.log("DB SEEDING COMPLETED SUCCESSFULLY!");
  return {
    productsSeededCount: createdProducts.length,
    message: "DB Seeding Completed successfully!"
  };
};

module.exports = {
  runSeeder
};
