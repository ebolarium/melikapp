const XLSX = require('xlsx');
const mongoose = require('mongoose');
const Company = require('./models/Company');
const User = require('./models/User');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/crm_app');

async function importData() {
  try {
    console.log('🚀 Starting data import process...');
    
    // Find a default user to assign as createdBy
    let defaultUser = await User.findOne({ level: { $in: ['Admin', 'Senior', 'Junior'] } });
    if (!defaultUser) {
      console.log('❌ No admin or manager user found. Please create at least one user first.');
      process.exit(1);
    }
    
    console.log(`📝 Using default user: ${defaultUser.userName} (${defaultUser.email})`);
    
    // Read Excel file
    const workbook = XLSX.readFile('../data.xlsx');
    const worksheet = workbook.Sheets['data'];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Found ${jsonData.length} records in Excel file`);
    
    let imported = 0;
    let skipped = 0;
    let errors = 0;
    
    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      
      try {
        // Transform the data
        const companyData = transformRowData(row, defaultUser._id);
        
        // Skip if no company name
        if (!companyData.companyName || companyData.companyName.trim() === '') {
          skipped++;
          continue;
        }
        
        // Check if company already exists
        const existingCompany = await Company.findOne({ 
          companyName: companyData.companyName 
        });
        
        if (existingCompany) {
          console.log(`⚠️  Company already exists: ${companyData.companyName}`);
          skipped++;
          continue;
        }
        
        // Create new company
        const newCompany = new Company(companyData);
        await newCompany.save();
        
        imported++;
        
        if (imported % 100 === 0) {
          console.log(`✅ Imported ${imported} companies so far...`);
        }
        
      } catch (error) {
        errors++;
        console.log(`❌ Error importing row ${i + 1}: ${error.message}`);
      }
    }
    
    console.log('\n📈 IMPORT SUMMARY:');
    console.log(`✅ Successfully imported: ${imported} companies`);
    console.log(`⚠️  Skipped: ${skipped} companies`);
    console.log(`❌ Errors: ${errors} companies`);
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

function transformRowData(row, defaultUserId) {
  const data = {
    companyName: cleanString(row.companyName),
    createdBy: defaultUserId
  };
  
  // Transform person field
  if (row.person && !isEmptyValue(row.person)) {
    data.person = cleanString(row.person);
  }
  
  // Transform phone field
  if (row.phone && !isEmptyValue(row.phone)) {
    data.phone = cleanString(row.phone);
  }
  
  // Transform email field
  if (row.email && !isEmptyValue(row.email)) {
    data.email = cleanString(row.email);
  }
  
  // Transform city field
  if (row.city && !isEmptyValue(row.city)) {
    data.city = cleanString(row.city);
  }
  
  // Transform production field
  if (row.production && !isEmptyValue(row.production)) {
    const production = cleanString(row.production);
    if (['Boyahane', 'Konfeksiyon'].includes(production)) {
      data.production = production;
    } else {
      data.production = 'Diğer';
    }
  }
  
  // Transform brands field
  if (row.brands && !isEmptyValue(row.brands)) {
    try {
      const brandsArray = JSON.parse(row.brands);
      const validBrands = brandsArray.filter(brand => 
        ['X-Rite', 'SDL Atlas', 'Pantone'].includes(brand)
      );
      if (validBrands.length > 0) {
        data.brands = validBrands;
      }
    } catch (e) {
      // If JSON parsing fails, ignore brands field
    }
  }
  
  // Transform spectro field
  if (row.spectro && !isEmptyValue(row.spectro)) {
    const spectro = cleanString(row.spectro);
    if (['Xrite', 'Datacolor', 'Minolta', 'Hunterlab'].includes(spectro)) {
      data.spectro = spectro;
    } else {
      data.spectro = 'Diğer';
    }
  }
  
  // Transform spectroAge field
  if (row.spectroAge && !isEmptyValue(row.spectroAge)) {
    const spectroAge = cleanString(row.spectroAge);
    if (['Eski', 'Orta', 'Yeni'].includes(spectroAge)) {
      data.spectroAge = spectroAge;
    }
  }
  
  // Transform notes field
  if (row.notes && !isEmptyValue(row.notes)) {
    data.notes = cleanString(row.notes);
  }
  
  // Transform isActive field
  if (typeof row.isActive === 'boolean') {
    data.isActive = row.isActive;
  }
  
  // Transform totalCalls field
  if (typeof row.totalCalls === 'number') {
    data.totalCalls = Math.max(0, row.totalCalls);
  }
  
  // Transform lastContactDate field
  if (row.lastContactDate && !isEmptyValue(row.lastContactDate)) {
    // Handle Excel date format (days since 1900-01-01)
    if (typeof row.lastContactDate === 'number') {
      const excelDate = new Date((row.lastContactDate - 25569) * 86400 * 1000);
      if (excelDate.getFullYear() > 1900 && excelDate.getFullYear() < 2100) {
        data.lastContactDate = excelDate;
      }
    }
  }
  
  return data;
}

function cleanString(value) {
  if (!value) return '';
  return value.toString().trim();
}

function isEmptyValue(value) {
  if (!value) return true;
  const str = value.toString().toLowerCase().trim();
  return str === '' || 
         str === 'eksik' || 
         str === 'belirtilmemiş' || 
         str === 'null' || 
         str === 'undefined';
}

// Run the import
importData(); 