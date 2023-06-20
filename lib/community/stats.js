import c from "lib/common";

export default class Stats {
  constructor({ result }) {
    // hold stats about what's in the graph
    this.stats = result.stats;

    // provide convenient access
    this.activities = this.stats.activities;
    this.members = this.stats.members;
    this.threads = this.stats.threads;
  }

  getActivityDateRange() {
    const { first, last } = this.stats.activities;
    return { minDate: first, maxDate: last };
  }

  // adjust the first and last dates to the beginning and end of
  // their days; this avoids clipping days while filtering
  getActivityDayRange() {
    const { first, last } = this.stats.activities;
    // adjust the dates to the start and end of the respective days
    let minDate = c.startOfDay(first);
    let maxDate = c.endOfDay(last);
    return { minDate, maxDate };
  }
}
