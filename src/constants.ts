export const CRON_PATTERNS = {
  WEEKLY_RESET: '0 8 * * 1', // Every Monday at 8 AM
  BUSINESS_HOURS: '*/5 10-20 * * 1-5', // Every 5 minutes from 10 AM to 8 PM on weekdays
} as const;

export const BUSINESS_HOURS = {
  START: 10,
  END: 20,
} as const;

export const WEEKDAYS = {
  MONDAY: 1,
  FRIDAY: 5,
} as const; 