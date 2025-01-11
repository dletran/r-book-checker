import { DateChecker } from './date-checker';
import { FormParser } from './form-parser';
import { Notifier } from './notifier';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

dotenv.config();

async function getHtmlContent(source: string, useLocalFile: boolean): Promise<string> {
  if (useLocalFile) {
    console.log('Reading from local file:', source);
    return await fs.readFile(source, 'utf-8');
  } else {
    console.log('Fetching from URL:', source);
    const response = await axios.get(source, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });
    return response.data;
  }
}

async function main() {
  try {
    const source = process.env.FORM_URL || '';
    const useLocalFile = process.env.USE_LOCAL_FILE === 'true';
    
    let filePath = source;
    if (useLocalFile) {
      filePath = path.join(__dirname, 'test', 'fixtures', 'form.html');
      const fileExists = await fs.access(filePath).then(() => true).catch(() => false);
      if (!fileExists) {
        throw new Error(`Test file not found: ${filePath}`);
      }
    }
    
    console.log(`Using ${useLocalFile ? 'local file' : 'URL'}: ${useLocalFile ? filePath : source}`);
    
    const htmlContent = await getHtmlContent(useLocalFile ? filePath : source, useLocalFile);
    const { daysOff, fullDates } = await FormParser.getBookingDates(htmlContent);

    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 25);

    const dateChecker = new DateChecker(daysOff, fullDates);
    const availableDates = dateChecker.getAvailableDates({
      start: startDate,
      end: endDate
    });

    console.log('\nAvailable dates:');
    console.log('---------------');
    availableDates.forEach(date => {
      console.log(date.toISOString().split('T')[0]);
    });

    // Send notification if dates are available
    if (availableDates.length > 0) {
      const notifier = new Notifier();
      await notifier.sendNotification(availableDates);
    }

    // Return the results for the cron job to process
    return {
      availableDates,
      fullDates,
      daysOff,
      htmlContent
    };
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
}

// For manual runs
if (require.main === module) {
  console.log('Starting manual check...');
  main()
    .then(result => {
      console.log('\nCheck completed!');
      if (result && result.availableDates && result.availableDates.length === 0) {
        console.log('No available dates found.');
      }
      process.exit(0);
    })
    .catch(error => {
      console.error('Check failed:', error);
      process.exit(1);
    });
}

// Export for cron job
export { main }; 