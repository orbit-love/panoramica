import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

import Filters from "./Filters";

export default function FilterDisplay({
  project,
  where,
  filters,
  setFilters,
  propertyNames,
}) {
  const [showFilters, setShowFilters] = useState(false);

  return (
    <>
      <div
        className={classnames(
          "flex absolute top-[1.0em] right-3 flex-col justify-end"
        )}
      >
        <button onClick={() => setShowFilters((showFilters) => !showFilters)}>
          <FontAwesomeIcon icon="filter" className="text-tertiary" />
        </button>
      </div>
      <div
        className={classnames({
          hidden: !showFilters,
        })}
      >
        <div className="px-6 mb-4">
          <React.Suspense fallback={<div />}>
            <Filters
              project={project}
              where={where}
              filters={filters}
              setFilters={setFilters}
              propertyNames={propertyNames}
            />
          </React.Suspense>
        </div>
      </div>
    </>
  );
}
