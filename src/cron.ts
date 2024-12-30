import * as cron from 'node-cron';
import { main } from './index';
import { CRON_PATTERNS } from './constants';

// Track if we found full dates this week
let foundFullDatesThisWeek = false;
let lastCheckWeek = -1;

interface CheckResult {
  availableDates: Date[];
  fullDates: string[];
  daysOff: string[];
}

// Reset the full dates flag every Monday at 8 AM
cron.schedule(CRON_PATTERNS.WEEKLY_RESET, () => {
  console.log('Weekly reset - clearing full dates flag');
  foundFullDatesThisWeek = false;
  lastCheckWeek = -1;
});

// Every 5 minutes from 10 AM to 8 PM on weekdays
function isDateInNextTwoWeeks(date: string): boolean {
  const dateObj = new Date(date);
  const today = new Date();
  
  // Get next Monday
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + (8 - today.getDay()) % 7);
  nextMonday.setHours(0, 0, 0, 0);
  
  // Get end of following week (Sunday)
  const twoWeeksEnd = new Date(nextMonday);
  twoWeeksEnd.setDate(nextMonday.getDate() + 13); // Next two weeks minus one day
  twoWeeksEnd.setHours(23, 59, 59, 999);
  
  return dateObj >= nextMonday && dateObj <= twoWeeksEnd;
}

// Wrapper function to handle checks and full dates logic
async function performCheck(checkType: string) {
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  
  // Skip if we already found full dates this week
  if (foundFullDatesThisWeek) {
    console.log(`Skipping ${checkType} - dates already found for next two weeks`);
    return;
  }

  try {
    const result: CheckResult | undefined = await main();
    
    // Check if we have any dates within the next 2 weeks
    if (result && result.availableDates && result.availableDates.length > 0) {
      const hasAvailableDatesInNextTwoWeeks = result.availableDates.some(date => 
        isDateInNextTwoWeeks(date.toISOString())
      );

      if (hasAvailableDatesInNextTwoWeeks) {
        console.log('Found available dates within next 2 calendar weeks - pausing checks until next Monday');
        foundFullDatesThisWeek = true;
        lastCheckWeek = currentWeek;
      }
    }
  } catch (error) {
    console.error(`Error in ${checkType}:`, error);
  }
}

// Initialize schedule
cron.schedule(CRON_PATTERNS.BUSINESS_HOURS, async () => {
  const now = new Date();
  console.log(`Running business hours check at ${now.toLocaleString('es-ES')}`);
  await performCheck('business hours check');
});

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

console.log('Cron job started with simplified business hours monitoring'); 