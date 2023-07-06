import React from "react";
import classnames from "classnames";

import Thread from "components/compact/thread";

export default function Activities(props) {
  const { activities, onClickActivity } = props;
  return (
    <>
      {activities.map((activity, index) => (
        <div
          key={activity.id}
          onClick={(e) => onClickActivity(e, activity)}
          className={classnames(
            "flex flex-col py-3 px-4 cursor-pointer w-[450px]",
            {
              "bg-indigo-800 bg-opacity-20 hover:bg-indigo-800 hover:bg-opacity-50":
                index % 2 === 0,
              "bg-blue-900 bg-opacity-20 hover:bg-opacity-30": index % 2 === 1,
            }
          )}
        >
          <Thread key={activity.id} activity={activity} {...props} />
        </div>
      ))}
    </>
  );
}
