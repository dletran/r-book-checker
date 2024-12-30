interface DateRange {
  start: Date;
  end: Date;
}

export class DateChecker {
  private daysOff: string[];
  private fullDates: string[];
  
  constructor(daysOff: string[], fullDates: string[]) {
    this.daysOff = daysOff;
    this.fullDates = fullDates;
  }

  public getAvailableDates(range: DateRange): Date[] {
    const availableDates: Date[] = [];
    const currentDate = new Date(range.start);
    const endDate = range.end;

    while (currentDate <= endDate) {
      const dateString = this.formatDate(currentDate);
      
      // Check if date is not in daysOff array and not in fullDates array
      if (!this.daysOff.includes(dateString) && !this.fullDates.includes(dateString)) {
        // Check if it's not weekend (0 = Sunday, 6 = Saturday)
        if (currentDate.getDay() !== 0 && currentDate.getDay() !== 6) {
          availableDates.push(new Date(currentDate));
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return availableDates;
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
} 