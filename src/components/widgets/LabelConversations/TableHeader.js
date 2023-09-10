import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";
import PropertyFilter from "./PropertyFilter";

export default function TableHeader({
  project,
  projectId,
  filters,
  setFilters,
  propertyFilters,
  setPropertyFilters,
  controlledProperties,
  selectAllCheckboxValue,
  setSelectAllCheckboxValue,
  propertyNames,
  refetchNow,
  setWhere,
  defaultWhereClauses,
}) {
  const { refetch } = useQuery(GetPropertyFiltersQuery, {
    notifyOnNetworkStatusChange: true, // so that loading is true on refetch
    variables: {
      projectId,
    },
    onCompleted: (data) => {
      var {
        projects: [{ propertyFilters }],
      } = data;
      // remove any controller properties for this labeling project or others
      propertyFilters = propertyFilters.filter(
        ({ name }) => !name.endsWith(".status")
      );
      // put any filters matching propertyNames first, then sort alphabetically
      propertyFilters.sort((a, b) => {
        const aIndex = propertyNames.indexOf(a.name);
        const bIndex = propertyNames.indexOf(b.name);
        if (aIndex === -1 && bIndex === -1) {
          return 0;
        }
        if (aIndex === -1) {
          return 1;
        }
        if (bIndex === -1) {
          return -1;
        }
        if (a.name < b.name) {
          return -1;
        }
        if (a.name > b.name) {
          return 1;
        }
        return 0;
      });
      setPropertyFilters(propertyFilters);
    },
  });

  React.useEffect(() => {
    if (refetchNow) {
      refetch();
    }
  }, [refetchNow, refetch]);

  return (
    <thead>
      <tr className="text-left bg-gray-50 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <th className="p-2">
          <div className="flex justify-center w-6">
            <input
              type="checkbox"
              onChange={(e) => {
                setSelectAllCheckboxValue(e.target.checked);
              }}
              checked={selectAllCheckboxValue}
            />
          </div>
        </th>
        <th className="p-2">Conversation</th>
        {controlledProperties.map(({ name }) => (
          <th className="p-2" key={name}>
            <div>{name.split(".").slice(-1)}</div>
          </th>
        ))}
        {propertyFilters.map(({ name, values }) => {
          return (
            <th className="p-2 whitespace-nowrap" key={name}>
              <div className="flex items-center space-x-2">
                <PropertyFilter
                  name={name}
                  values={values}
                  setFilters={setFilters}
                  defaultWhereClauses={defaultWhereClauses}
                  project={project}
                  filters={filters}
                  setWhere={setWhere}
                  refetch={refetch}
                />
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
}
