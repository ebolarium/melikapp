const { fromZonedTime, toZonedTime, format } = require('date-fns-tz');

// Turkey timezone
const TURKEY_TIMEZONE = 'Europe/Istanbul';

/**
 * Get current date and time in Turkey timezone
 * @returns {Date} Current Turkey time as Date object
 */
const getTurkeyNow = () => {
  const utcNow = new Date();
  const turkeyTime = toZonedTime(utcNow, TURKEY_TIMEZONE);
  return turkeyTime;
};

/**
 * Get Turkey date with time set to 00:00:00 (start of day)
 * @param {Date} date - Optional date, defaults to today
 * @returns {Date} Turkey date at start of day
 */
const getTurkeyDateOnly = (date = new Date()) => {
  const turkeyTime = toZonedTime(date, TURKEY_TIMEZONE);
  turkeyTime.setHours(0, 0, 0, 0);
  return turkeyTime;
};

/**
 * Convert a date to Turkey timezone and format as YYYY-MM-DD
 * @param {Date} date - Date to format
 * @returns {string} Formatted date string
 */
const formatTurkeyDate = (date) => {
  const turkeyTime = toZonedTime(date, TURKEY_TIMEZONE);
  return format(turkeyTime, 'yyyy-MM-dd', { timeZone: TURKEY_TIMEZONE });
};

/**
 * Check if two dates are the same day in Turkey timezone
 * @param {Date} date1 
 * @param {Date} date2 
 * @returns {boolean} True if same day in Turkey timezone
 */
const isSameTurkeyDay = (date1, date2) => {
  const turkey1 = toZonedTime(date1, TURKEY_TIMEZONE);
  const turkey2 = toZonedTime(date2, TURKEY_TIMEZONE);
  
  const isSame = turkey1.getFullYear() === turkey2.getFullYear() &&
         turkey1.getMonth() === turkey2.getMonth() &&
         turkey1.getDate() === turkey2.getDate();
         
  return isSame;
};

/**
 * Get UTC date object from Turkey date (for MongoDB storage)
 * @param {Date} turkeyDate - Date in Turkey timezone
 * @returns {Date} UTC date for storage
 */
const turkeyToUtc = (turkeyDate) => {
  return fromZonedTime(turkeyDate, TURKEY_TIMEZONE);
};

/**
 * Get Turkey timezone info
 * @returns {string} Turkey timezone string
 */
const getTurkeyTimezone = () => {
  return TURKEY_TIMEZONE;
};

module.exports = {
  getTurkeyNow,
  getTurkeyDateOnly,
  formatTurkeyDate,
  isSameTurkeyDay,
  turkeyToUtc,
  getTurkeyTimezone
}; 