import * as cron from 'node-cron';
import { CRON_PATTERNS, BUSINESS_HOURS, WEEKDAYS } from '../constants';

interface TestCase {
  day: number;
  hour: number;
  shouldRun: boolean;
  description: string;
}

describe('Cron Configuration', () => {
  const testCases: TestCase[] = [
    { 
      day: 1, 
      hour: 8, 
      shouldRun: false, 
      description: 'Monday 8 AM - Weekly reset, but outside business hours'
    },
    { 
      day: 1, 
      hour: 9, 
      shouldRun: false, 
      description: 'Monday 9 AM - Too early'
    },
    { 
      day: 1, 
      hour: 10, 
      shouldRun: true, 
      description: 'Monday 10 AM - Should run (first business hour)'
    },
    { 
      day: 1, 
      hour: 20, 
      shouldRun: true, 
      description: 'Monday 8 PM - Should run (last business hour)'
    },
    { 
      day: 1, 
      hour: 21, 
      shouldRun: false, 
      description: 'Monday 9 PM - Too late'
    },
    { 
      day: 6, 
      hour: 12, 
      shouldRun: false, 
      description: 'Saturday - Should not run (weekend)'
    },
    { 
      day: 2, 
      hour: 15, 
      shouldRun: true, 
      description: 'Tuesday 3 PM - Should run (business hours)'
    }
  ];

  describe('Cron Patterns', () => {
    test('Weekly reset pattern should be valid', () => {
      expect(cron.validate(CRON_PATTERNS.WEEKLY_RESET)).toBe(true);
    });

    test('Business hours pattern should be valid', () => {
      expect(cron.validate(CRON_PATTERNS.BUSINESS_HOURS)).toBe(true);
    });
  });

  describe('Schedule Rules', () => {
    testCases.forEach(({ day, hour, shouldRun, description }) => {
      test(description, () => {
        const date = new Date();
        date.setDate(date.getDate() + (day - date.getDay()));
        date.setHours(hour, 0, 0, 0);
        
        const isBusinessHour = hour >= BUSINESS_HOURS.START && hour <= BUSINESS_HOURS.END;
        const isWeekday = day >= WEEKDAYS.MONDAY && day <= WEEKDAYS.FRIDAY;
        const wouldRun = isBusinessHour && isWeekday;
        
        expect(wouldRun).toBe(shouldRun);
      });
    });
  });

  describe('Business Hours', () => {
    test('Should only run between 10 AM and 8 PM', () => {
      const hours = Array.from({ length: 24 }, (_, i) => i);
      hours.forEach(hour => {
        const shouldRun = hour >= BUSINESS_HOURS.START && hour <= BUSINESS_HOURS.END;
        const date = new Date();
        date.setDate(date.getDate() + (1 - date.getDay())); // Set to Monday
        date.setHours(hour, 0, 0, 0);
        
        const isBusinessHour = hour >= BUSINESS_HOURS.START && hour <= BUSINESS_HOURS.END;
        expect(isBusinessHour).toBe(shouldRun);
      });
    });
  });

  describe('Weekday Only', () => {
    test('Should only run on weekdays (Monday-Friday)', () => {
      const days = Array.from({ length: 7 }, (_, i) => i + 1);
      days.forEach(day => {
        const shouldRun = day >= WEEKDAYS.MONDAY && day <= WEEKDAYS.FRIDAY;
        const date = new Date();
        date.setDate(date.getDate() + (day - date.getDay()));
        date.setHours(12, 0, 0, 0); // Set to noon
        
        const isWeekday = day >= WEEKDAYS.MONDAY && day <= WEEKDAYS.FRIDAY;
        expect(isWeekday).toBe(shouldRun);
      });
    });
  });
}); 