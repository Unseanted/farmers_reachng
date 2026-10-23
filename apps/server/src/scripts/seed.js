/**
 * Seed script – creates a super admin and optional demo data.
 * Usage: node src/scripts/seed.js
 * Requires MONGODB_URI and optionally SUPER_ADMIN_EMAIL / SUPER_ADMIN_PASSWORD in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const StorageFacility = require('../models/StorageFacility');

async function seed() {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/farmerreachng';
  await mongoose.connect(uri);
  console.log('Connected to MongoDB');

  const email = process.env.SUPER_ADMIN_EMAIL || 'superadmin@farmerreachng.com';
  const password = process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!';

  let admin = await User.findOne({ email });
  if (!admin) {
    admin = await User.create({
      name: 'Super Admin',
      email,
      password,
      role: 'super_admin',
      phone: '08000000000',
      lga: 'Jos North',
    });
    console.log(`✅ Super admin created: ${email} / ${password}`);
  } else {
    console.log(`ℹ️  Super admin already exists: ${email}`);
  }

  // Demo extension officer
  const officerEmail = 'officer@farmerreachng.com';
  let officer = await User.findOne({ email: officerEmail });
  if (!officer) {
    officer = await User.create({
      name: 'Ada Extension',
      email: officerEmail,
      password: 'Officer123!',
      role: 'extension_officer',
      phone: '08011112222',
      lga: 'Jos South',
      organization: 'Plateau ADP',
    });
    console.log(`✅ Extension officer: ${officerEmail} / Officer123!`);
  }

  // Demo farmer
  const farmerEmail = 'farmer@farmerreachng.com';
  let farmer = await User.findOne({ email: farmerEmail });
  if (!farmer) {
    farmer = await User.create({
      name: 'Musa Farmer',
      email: farmerEmail,
      password: 'Farmer123!',
      role: 'farmer',
      phone: '08033334444',
      lga: 'Barkin Ladi',
      crops: ['Tomato', 'Irish Potato', 'Maize'],
      irrigationStatus: 'partial',
    });
    console.log(`✅ Farmer: ${farmerEmail} / Farmer123!`);
  }

  // Demo storage operator + facility
  const opEmail = 'storage@farmerreachng.com';
  let operator = await User.findOne({ email: opEmail });
  if (!operator) {
    operator = await User.create({
      name: 'Yakubu Storage',
      email: opEmail,
      password: 'Storage123!',
      role: 'storage_operator',
      phone: '08055556666',
      lga: 'Jos East',
      organization: 'Plateau Cold Chain Ltd',
    });
    console.log(`✅ Storage operator: ${opEmail} / Storage123!`);
  }

  const facilityCount = await StorageFacility.countDocuments();
  if (facilityCount === 0) {
    await StorageFacility.create([
      {
        name: 'Jos Cold Store A',
        description: 'Modern cold storage for perishables – tomatoes, potatoes, vegetables.',
        type: 'cold',
        lga: 'Jos East',
        address: 'Along Bauchi Road, Jos',
        totalCapacityKg: 50000,
        availableCapacityKg: 50000,
        pricePerKgPerDay: 15,
        features: ['24/7 security', 'temperature monitoring', 'loading bay'],
        operator: operator._id,
      },
      {
        name: 'Barkin Ladi Ambient Warehouse',
        description: 'Dry ambient storage for grains and non-perishables.',
        type: 'warehouse',
        lga: 'Barkin Ladi',
        address: 'Market Road, Barkin Ladi',
        totalCapacityKg: 100000,
        availableCapacityKg: 100000,
        pricePerKgPerDay: 5,
        features: ['pest control', 'security'],
        operator: operator._id,
      },
      {
        name: 'Mangu Silo Complex',
        description: 'Grain silos suitable for maize, sorghum, millet.',
        type: 'silo',
        lga: 'Mangu',
        address: 'Mangu Town',
        totalCapacityKg: 200000,
        availableCapacityKg: 200000,
        pricePerKgPerDay: 3,
        features: ['aeration', 'moisture control'],
        operator: operator._id,
      },
    ]);
    console.log('✅ Demo storage facilities created');
  }

  console.log('\n🎉 Seed complete. You can log in with the accounts above.');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
