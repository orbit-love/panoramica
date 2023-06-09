import React from "react";

import c from "lib/common";
import MultiRangeSlider from "components/multiRangeSlider";

const ActivitiesSlider = ({ low, high, setLow, setHigh, activities }) => {
  const onSliderChange = ({ min, max }) => {
    setLow(min);
    setHigh(max);
  };

  var slice = activities?.slice(low, high);

  return (
    <MultiRangeSlider
      min={0}
      max={activities.length}
      minCurrent={low}
      maxCurrent={high}
      minLabel={c.formatDateShort(slice[0]?.timestamp)}
      maxLabel={c.formatDateShort(slice[slice.length - 1]?.timestamp)}
      onChange={onSliderChange}
    />
  );
};

export default ActivitiesSlider;
