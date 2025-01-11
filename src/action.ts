import { main } from './index';
import fs from 'fs/promises';

interface State {
  foundFullDatesThisWeek: boolean;
  lastCheckWeek: number;
  lastHtmlContent?: string;
  lastCheckTimestamp?: string;
}

async function loadState(): Promise<State> {
  try {
    const data = await fs.readFile('state.json', 'utf-8');
    return JSON.parse(data);
  } catch {
    return { foundFullDatesThisWeek: false, lastCheckWeek: -1 };
  }
}

async function saveState(state: State): Promise<void> {
  await fs.writeFile('state.json', JSON.stringify(state));
}

export async function performCheck() {
  const state = await loadState();
  const now = new Date();
  const currentWeek = getWeekNumber(now);
  
  // Reset state on first run of Monday
  if (now.getDay() === 1 && state.lastCheckWeek !== currentWeek) {
    console.log('First run of Monday detected - resetting state');
    state.foundFullDatesThisWeek = false;
    state.lastCheckWeek = currentWeek;

    await saveState(state);
  }

  if (state.foundFullDatesThisWeek) {
    console.log('Skipping check - dates already found for next two weeks');
    return;
  }

  try {
    const result = await main();
    
    // Store the HTML content and timestamp
    state.lastHtmlContent = result?.htmlContent;
    state.lastCheckTimestamp = new Date().toISOString();
    
    if (result?.availableDates && result.availableDates.length > 0) {
      const hasAvailableDatesInNextTwoWeeks = result.availableDates.some(date => 
        isDateInNextTwoWeeks(date.toISOString())
      );

      if (hasAvailableDatesInNextTwoWeeks) {
        state.foundFullDatesThisWeek = true;
        console.log('Found available dates - pausing checks until next Monday');
      }
    }
    
    await saveState(state);
  } catch (error) {
    console.error('Error in check:', error);
  }
}

// Helper function to get week number
export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
}

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

// If running directly (not as a module)
if (require.main === module) {
  performCheck().catch(console.error);
}

export { isDateInNextTwoWeeks }; 