const mongoose = require('mongoose');
const { User, Company, CallRecord } = require('../models');

// Sample data for seeding
const sampleUsers = [
  {
    userName: 'Admin User',
    email: 'admin@melikapp.com',
    password: 'admin123',
    targetCallNumber: 100,
    level: 'Admin',
    points: 500
  },
  {
    userName: 'Sales Rep 1',
    email: 'sales1@melikapp.com',
    password: 'sales123',
    targetCallNumber: 50,
    level: 'Senior',
    points: 250
  },
  {
    userName: 'Sales Rep 2',
    email: 'sales2@melikapp.com',
    password: 'sales123',
    targetCallNumber: 30,
    level: 'Junior',
    points: 100
  }
];

const sampleCompanies = [
  {
    companyName: 'Örnek Tekstil A.Ş.',
    person: 'Mehmet Yılmaz',
    phone: '+90 212 555 0001',
    email: 'mehmet@ornektekstil.com',
    city: 'İstanbul',
    production: 'Boyahane',
    brands: ['X-Rite', 'Pantone'],
    spectro: 'Xrite',
    spectroAge: 'Orta',
    notes: 'Büyük bir tekstil firması, potansiyel müşteri'
  },
  {
    companyName: 'Modern Konfeksiyon Ltd.',
    person: 'Ayşe Demir',
    phone: '+90 232 555 0002',
    email: 'ayse@modernkonfeksiyon.com',
    city: 'İzmir',
    production: 'Konfeksiyon',
    brands: ['SDL Atlas'],
    spectro: 'Datacolor',
    spectroAge: 'Yeni',
    notes: 'Orta ölçekli konfeksiyon firması'
  },
  {
    companyName: 'Kalite Lab Hizmetleri',
    person: 'Ali Kaya',
    phone: '+90 312 555 0003',
    email: 'ali@kalitelab.com',
    city: 'Ankara',
    production: 'Diğer',
    brands: ['X-Rite'],
    spectro: 'Hunterlab',
    spectroAge: 'Eski',
    notes: 'Laboratuvar hizmetleri veren firma'
  }
];

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Company.deleteMany({});
    await CallRecord.deleteMany({});
    console.log('📊 Cleared existing data');

    // Create users
    const users = await User.create(sampleUsers);
    console.log(`👥 Created ${users.length} users`);

    // Create companies with user references
    const companiesWithUsers = sampleCompanies.map((company, index) => ({
      ...company,
      createdBy: users[0]._id, // Admin creates all companies
      assignedTo: users[index % users.length]._id // Distribute among users
    }));

    const companies = await Company.create(companiesWithUsers);
    console.log(`🏢 Created ${companies.length} companies`);

    // Create sample call records
    const sampleCallRecords = [
      {
        company: companies[0]._id,
        user: users[1]._id,
        callDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        sekretereТakildik: true,
        potansiyel: true,
        callDuration: 15,
        notes: 'İlk görüşme yapıldı, satınalma ile görüşme planlandı',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        callType: 'Cold Call',
        callStatus: 'Completed'
      },
      {
        company: companies[1]._id,
        user: users[2]._id,
        callDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        satinaImayaYonlendirildi: true,
        callDuration: 10,
        notes: 'Satınalma departmanına yönlendirildi',
        callType: 'Follow Up',
        callStatus: 'Completed'
      },
      {
        company: companies[2]._id,
        user: users[1]._id,
        callDate: new Date(),
        labSefineUlasilamadi: true,
        callDuration: 5,
        notes: 'Lab şefi toplantıda, tekrar aranacak',
        followUpRequired: true,
        followUpDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        callType: 'Return Call',
        callStatus: 'Completed'
      }
    ];

    const callRecords = await CallRecord.create(sampleCallRecords);
    console.log(`📞 Created ${callRecords.length} call records`);

    console.log('✅ Database seeding completed successfully!');
    console.log('\n📋 Summary:');
    console.log(`Users: ${users.length}`);
    console.log(`Companies: ${companies.length}`);
    console.log(`Call Records: ${callRecords.length}`);

    return {
      users,
      companies,
      callRecords
    };

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

// Run seeder if called directly
if (require.main === module) {
  require('dotenv').config();
  
  mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm_app')
    .then(() => {
      console.log('📊 Connected to MongoDB for seeding');
      return seedDatabase();
    })
    .then(() => {
      console.log('🎉 Seeding completed, closing connection');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Seeding failed:', error);
      process.exit(1);
    });
}

module.exports = seedDatabase; 