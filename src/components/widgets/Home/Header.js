import React, { useCallback, useEffect, useState } from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { putProjectRefresh } from "src/data/client/fetches";

export default function Header({ project, imported }) {
  const [refresh, setRefresh] = useState(true);

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    await putProjectRefresh({ project, onSuccess: () => {} });
    console.log("Project refreshed");
  }, [project]);

  // refresh the project every minute to fetch new data
  useEffect(() => {
    if (imported && refresh) {
      var interval = setInterval(() => {
        refreshProject();
      }, 60 * 1000);
      return () => {
        clearInterval(interval);
      };
    }
  }, [imported, refresh, refreshProject]);

  return (
    <div className="py-2 px-6">
      <div className="flex items-center py-2 w-full whitespace-nowrap">
        <div className="overflow-hidden font-semibold text-ellipsis">
          {project.name}
        </div>
        <div
          title="Auto update every 60s"
          className="cursor-pointer"
          onClick={() => setRefresh(!refresh)}
        >
          <FontAwesomeIcon
            icon="circle"
            className={classnames("pl-2 text-sm", {
              "text-green-500": refresh,
              "text-gray-500": !refresh,
            })}
          />
        </div>
        <div className="mx-auto" />
      </div>
    </div>
  );
}
