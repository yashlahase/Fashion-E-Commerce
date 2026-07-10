const Product = require('../models/Product');

// @desc    Get all products (with search, filter, sort, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res, next) => {
  try {
    const { keyword, category, brand, minPrice, maxPrice, size, rating, featured, sort, page, limit } = req.query;

    let query = {};

    // Search by Name, Brand, Description, or Category names/synonyms
    if (keyword) {
      const Category = require('../models/Category');
      const matchingCategories = await Category.find({
        name: { $regex: keyword, $options: 'i' }
      });
      const categoryIds = matchingCategories.map(c => c._id);

      const keywordLower = keyword.toLowerCase();
      const additionalCategoryNames = [];

      if (keywordLower.includes('shoe') || keywordLower.includes('sneaker') || keywordLower.includes('footwear') || keywordLower.includes('boot')) {
        additionalCategoryNames.push('Mens Shoes', 'Womens Shoes', 'Footwear');
      }
      if (keywordLower === 'men' || keywordLower === 'mens') {
        additionalCategoryNames.push('Mens Shirts', 'Mens Shoes', 'Mens Watches', 'Men\'s Clothing');
      }
      if (keywordLower === 'women' || keywordLower === 'womens') {
        additionalCategoryNames.push('Womens Dresses', 'Womens Shoes', 'Womens Watches', 'Womens Bags', 'Womens Jewellery', 'Women\'s Clothing');
      }
      if (keywordLower.includes('accessory') || keywordLower.includes('bag') || keywordLower.includes('watch') || keywordLower.includes('jewel') || keywordLower.includes('sunglass')) {
        additionalCategoryNames.push('Mens Watches', 'Womens Watches', 'Womens Bags', 'Womens Jewellery', 'Sunglasses', 'Accessories');
      }
      if (keywordLower.includes('shirt') || keywordLower.includes('tshirt') || keywordLower.includes('t-shirt') || keywordLower.includes('top')) {
        additionalCategoryNames.push('Mens Shirts', 'Tops', 'Men\'s Clothing', 'Women\'s Clothing');
      }
      if (keywordLower.includes('dress') || keywordLower.includes('clothing') || keywordLower.includes('apparel') || keywordLower.includes('garment')) {
        additionalCategoryNames.push('Womens Dresses', 'Mens Shirts', 'Tops', 'Men\'s Clothing', 'Women\'s Clothing');
      }

      if (additionalCategoryNames.length > 0) {
        const extraCategories = await Category.find({
          name: { $in: additionalCategoryNames }
        });
        extraCategories.forEach(c => {
          if (!categoryIds.some(id => id.equals(c._id))) {
            categoryIds.push(c._id);
          }
        });
      }

      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { brand: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
      ];

      if (categoryIds.length > 0) {
        query.$or.push({ category: { $in: categoryIds } });
      }
    }

    // Filter by Category
    if (category) {
      const categories = category.split(',');
      query.category = { $in: categories };
    }

    // Filter by Brand
    if (brand) {
      const brands = brand.split(',');
      query.brand = { $in: brands };
    }

    // Filter by Price Range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Filter by Size
    if (size) {
      const sizes = size.split(',');
      query.sizes = { $in: sizes };
    }

    // Filter by Rating
    if (rating) {
      query.rating = { $gte: Number(rating) };
    }

    // Filter by Featured
    if (featured) {
      query.featured = featured === 'true';
    }

    // Pagination setup
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Sorting setup
    let sortQuery = {};
    if (sort === 'newest') {
      sortQuery = { createdAt: -1 };
    } else if (sort === 'priceAsc') {
      sortQuery = { price: 1 };
    } else if (sort === 'priceDesc') {
      sortQuery = { price: -1 };
    } else if (sort === 'rating') {
      sortQuery = { rating: -1 };
    } else {
      sortQuery = { createdAt: -1 }; // default sort
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .populate('category', 'name')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);

    res.json({
      products,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      totalProducts: total,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name');

    if (product) {
      res.json(product);
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      images,
      sizes,
      colors,
      featured,
    } = req.body;

    if (!name || !description || !category || !brand || price === undefined || stock === undefined || !images) {
      res.status(400);
      return next(new Error('Please provide all required fields'));
    }

    const product = await Product.create({
      name,
      description,
      category,
      brand,
      price,
      discountPrice: discountPrice || 0,
      stock,
      images,
      sizes: sizes || ['M'],
      colors: colors || [],
      featured: featured || false,
    });

    res.status(201).json(product);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res, next) => {
  try {
    const {
      name,
      description,
      category,
      brand,
      price,
      discountPrice,
      stock,
      images,
      sizes,
      colors,
      featured,
    } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
      product.name = name || product.name;
      product.description = description || product.description;
      product.category = category || product.category;
      product.brand = brand || product.brand;
      product.price = price !== undefined ? price : product.price;
      product.discountPrice = discountPrice !== undefined ? discountPrice : product.discountPrice;
      product.stock = stock !== undefined ? stock : product.stock;
      product.images = images || product.images;
      product.sizes = sizes || product.sizes;
      product.colors = colors || product.colors;
      product.featured = featured !== undefined ? featured : product.featured;

      const updatedProduct = await product.save();
      res.json(updatedProduct);
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      await Product.deleteOne({ _id: req.params.id });
      res.json({ message: 'Product removed successfully' });
    } else {
      res.status(404);
      return next(new Error('Product not found'));
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Reseed database with DummyJSON
// @route   POST /api/products/reseed
// @access  Public
const reseedDatabase = async (req, res, next) => {
  try {
    const { runSeeder } = require('../utils/seeder');
    const result = await runSeeder();
    res.status(200).json({
      success: true,
      message: 'Database reseeded successfully with DummyJSON products!',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  reseedDatabase,
};
