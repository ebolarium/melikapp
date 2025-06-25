const CallRecord = require('../models/CallRecord');
const Company = require('../models/Company');
const User = require('../models/User');
const { sendEmail } = require('./emailService');

/**
 * Generate and send daily report
 */
const sendDailyReport = async () => {
  try {
    // Find Melike user
    const melikeUser = await User.findOne({ userName: 'Melike Konuralp Yakın' });
    
    if (!melikeUser) {
      console.log('Melike Konuralp Yakın user not found, skipping daily report');
      return;
    }
    
    // Get today's date range (Turkey time)
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(today);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Get today's call records for Melike
    const todaysCallRecords = await CallRecord.find({
      user: melikeUser._id,
      callDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('company', 'companyName').sort({ callDate: -1 });
    
    // Generate report content
    const reportContent = await generateReportContent(todaysCallRecords);
    
    // Send email
    const recipient = process.env.NODE_ENV === 'production' 
      ? process.env.REPORT_RECIPIENTS // TODO: Add production emails later
      : 'baris@odakkimya.com.tr'; // Development
    
    await sendEmail({
      to: recipient,
      subject: `Arama Raporu - ${formatTurkishDate(today)}`,
      text: reportContent
    });
    
    console.log(`Daily report sent to ${recipient}`);
    
  } catch (error) {
    console.error('Error generating/sending daily report:', error);
    throw error;
  }
};

/**
 * Generate report content in Turkish
 */
const generateReportContent = async (callRecords) => {
  const callCount = callRecords.length;
  
  let report = `Arama Raporu - ${formatTurkishDate(new Date())}\n\n`;
  report += `Melike bugün ${callCount} arama yaptı.\n\n`;
  
  if (callCount > 0) {
    report += `Aranan firmalar ve sonuçlar:\n`;
    
    callRecords.forEach((record, index) => {
      const companyName = record.company?.companyName || 'Bilinmeyen Firma';
      const result = record.callResult || 'Sonuç girilmedi';
      report += `${index + 1}. ${companyName} - ${result}\n`;
    });
  } else {
    report += `Bugün hiç arama yapılmadı.\n`;
  }
  
  return report;
};

/**
 * Format date in Turkish
 */
const formatTurkishDate = (date) => {
  const months = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  
  return `${day} ${month} ${year}`;
};

module.exports = {
  sendDailyReport
}; 