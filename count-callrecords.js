const mongoose = require('mongoose');
require('dotenv').config();

async function countCallRecords() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const records = await mongoose.connection.db.collection('callrecords').find({ callResult: "Potansiyel" }, { company: 1 }).toArray();
    
    for (const record of records) {
      const company = await mongoose.connection.db.collection('companies').findOne({ _id: record.company }, { companyName: 1 });
      console.log(company ? company.companyName : 'Company not found');
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error(error.message);
  }
}

countCallRecords(); 