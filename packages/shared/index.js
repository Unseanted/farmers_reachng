// Shared constants and types for FarmerReachNG

const ROLES = {
  FARMER: 'farmer',
  EXTENSION_OFFICER: 'extension_officer',
  STORAGE_OPERATOR: 'storage_operator',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

const PLATEAU_LGAS = [
  'Barkin Ladi',
  'Bassa',
  'Bokkos',
  'Jos East',
  'Jos North',
  'Jos South',
  'Kanam',
  'Kanke',
  'Langtang North',
  'Langtang South',
  'Mangu',
  'Mikang',
  'Pankshin',
  'Qua\'an Pan',
  'Riyom',
  'Shendam',
  'Wase',
];

const STORAGE_TYPES = {
  AMBIENT: 'ambient',
  COLD: 'cold',
  SILO: 'silo',
  WAREHOUSE: 'warehouse',
};

const MESSAGE_CHANNELS = {
  SMS: 'sms',
  WHATSAPP: 'whatsapp',
};

const CROPS = [
  'Maize',
  'Rice',
  'Sorghum',
  'Millet',
  'Soybean',
  'Groundnut',
  'Tomato',
  'Pepper',
  'Onion',
  'Irish Potato',
  'Sweet Potato',
  'Yam',
  'Cassava',
  'Vegetables',
  'Other',
];

module.exports = {
  ROLES,
  PLATEAU_LGAS,
  STORAGE_TYPES,
  MESSAGE_CHANNELS,
  CROPS,
};
