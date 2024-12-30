import axios from 'axios';
import fs from 'fs/promises';

export class FormParser {
  // Simple patterns to match the exact variable names we want
  private static readonly DAYS_OFF_REGEX = /var daysOffarrOriginal = (\[.*?\]);/;
  private static readonly FULL_DATES_REGEX = /var fechas_completas = (\[.*?\]);/;

  public static async getBookingDates(htmlContent: string): Promise<{
    daysOff: string[];
    fullDates: string[];
  }> {
    try {
      const daysOff = this.extractArrayFromScript(htmlContent, this.DAYS_OFF_REGEX);
      const fullDates = this.extractArrayFromScript(htmlContent, this.FULL_DATES_REGEX);

      // Debug information
      console.log('Extraction results:');
      console.log('Days off found:', daysOff.length);
      console.log('Full dates found:', fullDates.length);

      return {
        daysOff,
        fullDates
      };
    } catch (error) {
      console.error('Error processing form:', error);
      throw error;
    }
  }

  private static extractArrayFromScript(html: string, regex: RegExp): string[] {
    const match = regex.exec(html);
    if (!match || !match[1]) {
      console.log('No match found for regex:', regex);
      return [];
    }

    try {
      return JSON.parse(match[1]);
    } catch (error) {
      console.error('Error parsing dates array:', error);
      return [];
    }
  }
} 