const mongoose = require('mongoose');
require('dotenv').config();

const Admin = require('../models/Admin');

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminData = {
      name: 'System Administrator',
      email: 'admin@madeasy.com',
      password: 'admin123',
      role: 'super_admin',
      permissions: ['users', 'cleaners', 'bookings', 'payments', 'reports']
    };

    console.log('🔧 Creating admin user...');

    // Check if admin exists
    let admin = await Admin.findOne({ email: adminData.email });
    
    if (admin) {
      console.log('⚠️  Admin already exists, updating password...');
      admin.password = adminData.password;
      await admin.save();
      console.log('✅ Password updated');
    } else {
      // Create new admin
      admin = await Admin.create(adminData);
      console.log('✅ Admin user created successfully!');
    }

    console.log('\n🎉 ADMIN CREATION COMPLETE');
    console.log('========================');
    console.log('📧 Email: admin@madeasy.com');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: super_admin');
    console.log('========================\n');
    
  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  }
};

createAdmin();