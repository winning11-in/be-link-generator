import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';

// MongoDB connection
const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI || "mongodb+srv://Vercel-Admin-atlas-cyan-yacht:NdRIXjpEpnwIu9CN@atlas-cyan-yacht.g7nbwaq.mongodb.net/?retryWrites=true&w=majority";
    await mongoose.connect(uri);
    console.log('✅ MongoDB Connected');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Reset password for a specific user
async function resetUserPassword(email, newPassword) {
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.log(`❌ User with email ${email} not found`);
      return false;
    }

    console.log(`📧 Found user: ${user.name} (${user.email})`);
    console.log(`🔐 Setting new password: ${newPassword}`);

    // Use the setPassword method from the User model
    await user.setPassword(newPassword);
    
    // Clear any existing reset tokens
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    
    await user.save();
    
    console.log('✅ Password updated successfully!');
    console.log('🔍 Testing new password...');
    
    // Test the new password
    const isMatch = await user.matchPassword(newPassword);
    console.log(`🧪 Password test: ${isMatch ? '✅ PASS' : '❌ FAIL'}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error updating password:', error);
    return false;
  }
}

// List all users
async function listUsers() {
  try {
    const users = await User.find().select('name email isAdmin subscriptionPlan createdAt');
    console.log('\n👥 All Users:');
    console.log('=' .repeat(80));
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.name} (${user.email}) - ${user.subscriptionPlan} - Admin: ${user.isAdmin}`);
    });
    console.log('=' .repeat(80));
  } catch (error) {
    console.error('❌ Error listing users:', error);
  }
}

// Create a new admin user
async function createAdminUser(name, email, password) {
  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    
    if (existingUser) {
      console.log(`❌ User with email ${email} already exists`);
      return false;
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password, // This will be hashed by the pre-save middleware
      isAdmin: true,
      isVerified: true,
      isEmailVerified: true,
      subscriptionPlan: 'enterprise'
    });

    console.log('✅ Admin user created successfully!');
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔐 Password: ${password}`);
    console.log(`👑 Admin: ${user.isAdmin}`);
    
    return true;
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
    return false;
  }
}

// Main function
async function main() {
  await connectDB();
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'list':
      await listUsers();
      break;
      
    case 'reset':
      const email = args[1];
      const newPassword = args[2];
      if (!email || !newPassword) {
        console.log('❌ Usage: node password-manager.js reset <email> <new-password>');
        break;
      }
      await resetUserPassword(email, newPassword);
      break;
      
    case 'create-admin':
      const adminName = args[1];
      const adminEmail = args[2];
      const adminPassword = args[3];
      if (!adminName || !adminEmail || !adminPassword) {
        console.log('❌ Usage: node password-manager.js create-admin <name> <email> <password>');
        break;
      }
      await createAdminUser(adminName, adminEmail, adminPassword);
      break;
      
    default:
      console.log('🔐 Password Manager for QR Code App');
      console.log('=' .repeat(50));
      console.log('Available commands:');
      console.log('  list                              - List all users');
      console.log('  reset <email> <new-password>      - Reset user password');
      console.log('  create-admin <name> <email> <password> - Create admin user');
      console.log('\nExamples:');
      console.log('  node password-manager.js list');
      console.log('  node password-manager.js reset user@example.com newpassword123');
      console.log('  node password-manager.js create-admin "Admin User" admin@example.com admin123');
      break;
  }
  
  mongoose.disconnect();
}

main().catch(console.error);