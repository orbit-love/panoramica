import React, { useCallback, useEffect, useState } from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { putProjectRefresh } from "src/data/client/fetches";
import Loader from "src/components/domains/ui/Loader";

export default function Header({ project, imported }) {
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(false);

  // don't set loading since this happens in the background
  const refreshProject = useCallback(async () => {
    if (!loading) {
      setLoading(true);
      putProjectRefresh({
        project,
        onSuccess: () => {
          setLoading(false);
          console.log("Project refreshed");
        },
      });
    }
  }, [project, loading]);

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
        {loading && <Loader className="pl-2 text-green-500" />}
        {!loading && (
          <div
            title="Auto update every 60s"
            className="cursor-pointer"
            onClick={async () => {
              if (!refresh) {
                refreshProject();
              }
              setRefresh(!refresh);
            }}
          >
            <FontAwesomeIcon
              icon="circle"
              className={classnames("pl-2 text-sm", {
                "text-green-500": refresh,
                "text-gray-500": !refresh,
              })}
            />
          </div>
        )}
      </div>
    </div>
  );
}
