const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/User');
const Cleaner = require('../models/Cleaner');

/**
 * Test script to verify cleaner creation saves to database
 * This script:
 * 1. Creates a test user
 * 2. Applies as cleaner (simulating the API call)
 * 3. Verifies both User and Cleaner documents are saved correctly
 */
const testCleanerSave = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    console.log(`📊 Database: ${mongoose.connection.name}\n`);

    // Create a test user
    const testEmail = `test-cleaner-${Date.now()}@test.com`;
    console.log('🔧 Creating test user...');
    
    let testUser = await User.create({
      name: 'Test Cleaner User',
      email: testEmail,
      password: 'test123456',
      phone: '+254712345678',
      role: 'user'
    });
    
    console.log(`✅ Test user created: ${testUser._id}`);
    console.log(`   Email: ${testEmail}\n`);

    // Simulate cleaner application
    console.log('🔧 Applying as cleaner...');
    
    // Update user's cleaner application (same as controller)
    testUser.cleanerApplication = {
      ...testUser.cleanerApplication,
      bio: 'Test cleaner bio',
      experience: 3,
      specialties: ['residential', 'deep_cleaning'],
      hourlyRate: 800,
      availability: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      workingHours: {
        start: '08:00',
        end: '17:00'
      },
      documents: {},
      status: 'pending',
      appliedAt: new Date()
    };

    // Save user document
    await testUser.save();
    console.log('✅ User document saved with cleanerApplication data\n');

    // Create cleaner document (same as controller)
    const cleaner = await Cleaner.findOneAndUpdate(
      { user: testUser._id },
      {
        user: testUser._id,
        bio: 'Test cleaner bio',
        experience: 3,
        specialties: ['residential', 'deep_cleaning'],
        hourlyRate: 800,
        availability: {
          monday: true,
          tuesday: true,
          wednesday: true,
          thursday: true,
          friday: true,
          saturday: false,
          sunday: false
        },
        workingHours: {
          start: '08:00',
          end: '17:00'
        },
        documents: {},
        isVerified: false
      },
      { upsert: true, new: true }
    );
    
    console.log(`✅ Cleaner document created: ${cleaner._id}\n`);

    // Verification: Query both collections
    console.log('🔍 Verifying data persistence...\n');
    
    // Verify User document
    const savedUser = await User.findById(testUser._id);
    if (!savedUser) {
      throw new Error('❌ User document not found in database');
    }
    
    if (savedUser.cleanerApplication.status !== 'pending') {
      throw new Error(`❌ User cleanerApplication status incorrect: ${savedUser.cleanerApplication.status}`);
    }
    
    if (!savedUser.cleanerApplication.bio) {
      throw new Error('❌ User cleanerApplication bio not saved');
    }
    
    if (!savedUser.cleanerApplication.hourlyRate) {
      throw new Error('❌ User cleanerApplication hourlyRate not saved');
    }
    
    console.log('✅ User document verification passed:');
    console.log(`   - cleanerApplication.status: ${savedUser.cleanerApplication.status}`);
    console.log(`   - cleanerApplication.bio: ${savedUser.cleanerApplication.bio}`);
    console.log(`   - cleanerApplication.hourlyRate: ${savedUser.cleanerApplication.hourlyRate}`);
    console.log(`   - cleanerApplication.appliedAt: ${savedUser.cleanerApplication.appliedAt}\n`);

    // Verify Cleaner document
    const savedCleaner = await Cleaner.findById(cleaner._id);
    if (!savedCleaner) {
      throw new Error('❌ Cleaner document not found in database');
    }
    
    if (savedCleaner.user.toString() !== testUser._id.toString()) {
      throw new Error('❌ Cleaner user reference incorrect');
    }
    
    if (!savedCleaner.bio) {
      throw new Error('❌ Cleaner bio not saved');
    }
    
    if (!savedCleaner.hourlyRate) {
      throw new Error('❌ Cleaner hourlyRate not saved');
    }
    
    if (savedCleaner.isVerified !== false) {
      throw new Error('❌ Cleaner isVerified should be false');
    }
    
    console.log('✅ Cleaner document verification passed:');
    console.log(`   - _id: ${savedCleaner._id}`);
    console.log(`   - user: ${savedCleaner.user}`);
    console.log(`   - bio: ${savedCleaner.bio}`);
    console.log(`   - hourlyRate: ${savedCleaner.hourlyRate}`);
    console.log(`   - isVerified: ${savedCleaner.isVerified}`);
    console.log(`   - specialties: ${savedCleaner.specialties.join(', ')}\n`);

    // Verify relationship
    const cleanerByUser = await Cleaner.findOne({ user: testUser._id });
    if (!cleanerByUser) {
      throw new Error('❌ Cannot find cleaner by user reference');
    }
    
    if (cleanerByUser._id.toString() !== cleaner._id.toString()) {
      throw new Error('❌ Cleaner document mismatch');
    }
    
    console.log('✅ Relationship verification passed:');
    console.log(`   - User ${testUser._id} correctly linked to Cleaner ${cleanerByUser._id}\n`);

    // Summary
    console.log('🎉 ALL VERIFICATIONS PASSED');
    console.log('='.repeat(50));
    console.log('✅ User document saved with cleanerApplication data');
    console.log('✅ Cleaner document created and saved');
    console.log('✅ Both documents verified in database');
    console.log('✅ Relationship between User and Cleaner confirmed');
    console.log('='.repeat(50));
    console.log('\n📝 Test Data:');
    console.log(`   User ID: ${testUser._id}`);
    console.log(`   Cleaner ID: ${cleaner._id}`);
    console.log(`   Email: ${testEmail}`);
    console.log('\n💡 You can verify this data in MongoDB or delete the test user.\n');

    // Optionally clean up test data
    // Uncomment the following lines to automatically delete test data:
    /*
    await Cleaner.deleteOne({ _id: cleaner._id });
    await User.deleteOne({ _id: testUser._id });
    console.log('🧹 Test data cleaned up');
    */
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('📦 MongoDB connection closed');
    process.exit(0);
  }
};

// Run the test
testCleanerSave();

