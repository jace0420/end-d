// src/utils/time.js

const MONTHS = [
  "Hammer", "Alturiak", "Ches", "Tarsakh", "Mirtul", "Kythorn",
  "Flamerule", "Eleasis", "Eleint", "Marpenoth", "Uktar", "Nightal"
];

const START_YEAR = 1492; 
const DAYS_PER_MONTH = 30;
const HOURS_PER_DAY = 24;

export const formatGameTime = (totalMinutes) => {
  // 1. Calculate Time of Day
  // Use Math.floor on totalMinutes first to clean up any floating point garbage
  const cleanTotal = Math.floor(totalMinutes);
  
  const minutesInDay = cleanTotal % (HOURS_PER_DAY * 60);
  const hour = Math.floor(minutesInDay / 60);
  
  // FIX: Ensure minute is an integer
  const minute = Math.floor(minutesInDay % 60);
  
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12; 
  const displayMinute = minute.toString().padStart(2, '0');
  
  const timeString = `${displayHour}:${displayMinute} ${ampm}`;

  // 2. Calculate Date
  const totalDays = Math.floor(cleanTotal / (HOURS_PER_DAY * 60));
  
  const year = START_YEAR + Math.floor(totalDays / 360);
  const dayOfYear = totalDays % 360;
  
  const monthIndex = Math.floor(dayOfYear / DAYS_PER_MONTH);
  const dayOfMonth = (dayOfYear % DAYS_PER_MONTH) + 1; 
  
  const monthName = MONTHS[monthIndex];

  const suffix = (d) => {
    if (d > 3 && d < 21) return 'th';
    switch (d % 10) {
      case 1:  return "st";
      case 2:  return "nd";
      case 3:  return "rd";
      default: return "th";
    }
  };

  const dateString = `${dayOfMonth}${suffix(dayOfMonth)} of ${monthName}, ${year} DR`;

  return { timeString, dateString, isNight: hour < 6 || hour > 20 };
};