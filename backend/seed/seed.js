const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { runSeeder } = require('../utils/seeder');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const seedDB = async () => {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fashion-ecommerce');
    console.log("Connected!");
    
    await runSeeder();
    
    await mongoose.connection.close();
    console.log("Seeding execution complete.");
    process.exit(0);
  } catch (error) {
    console.error("Seeding Error:", error.message);
    if (error.errors) {
      console.error("Validation Keys:", Object.keys(error.errors));
      for (const k of Object.keys(error.errors)) {
        console.error(`Field "${k}" error:`, error.errors[k].message);
      }
    }
    process.exit(1);
  }
};

seedDB();
