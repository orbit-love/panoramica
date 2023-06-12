import React from "react";
import MultiRangeSlider from "components/multiRangeSlider";
import c from "lib/common";

// low and high come in as strings - these are the current values
// the minimum and maximum are taken from activities
const ActivitiesSlider = ({ low, high, setLow, setHigh, community }) => {
  // the min and max date in all the activities
  const { minDate, maxDate } = community.getActivityDateRange();
  // the number of days between the min and max dates
  const daysInRange = c.diffDays(minDate, maxDate);

  // if the high value is 0, max it out
  if (high === 0) {
    high = daysInRange;
  }

  const formatter = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // use low and high integers to compute the labels
  const minDateCurrent = c.addDays(minDate, low);
  const maxDateCurrent = c.addDays(minDate, high);

  const minLabel = formatter.format(minDateCurrent);
  const maxLabel = formatter.format(maxDateCurrent);

  const onSliderChange = ({ min, max }) => {
    setLow(min);
    setHigh(max);
  };

  return (
    <MultiRangeSlider
      min={0}
      max={daysInRange}
      minCurrent={low}
      maxCurrent={high}
      minLabel={minLabel}
      maxLabel={maxLabel}
      onChange={onSliderChange}
    />
  );
};

export default ActivitiesSlider;
