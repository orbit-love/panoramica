import React, { useCallback } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";

export default function Filters({
  project,
  propertyNames,
  where,
  filters,
  setFilters,
}) {
  const { id: projectId } = project;
  const {
    data: {
      projects: [{ propertyFilters }],
    },
  } = useSuspenseQuery(GetPropertyFiltersQuery, {
    variables: {
      projectId,
      propertyNames,
      where,
    },
  });

  // when the filter selection changes, refetch the query
  const onChange = useCallback(
    (e, name) => {
      const { value } = e.target;
      const newFilters = filters.filter((filter) => filter.name !== name);
      if (value !== "all") {
        newFilters.push({ name, value });
      }
      setFilters(newFilters);
    },
    [filters, setFilters]
  );

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  return (
    <div className="flex flex-wrap px-6 mb-4">
      {propertyFilters.map(({ name, values }) => {
        return (
          <div key={name} className="mb-1 mr-2">
            <select onChange={(e) => onChange(e, name)} className="mb-2">
              <option value="all">
                {capitalizeFirstLetter(name).replace(/e?s$/, "")}
              </option>
              {values.map(({ value, count }) => {
                return (
                  <option key={value} value={value}>
                    {value} ({count})
                  </option>
                );
              })}
            </select>
          </div>
        );
      })}
    </div>
  );
}
