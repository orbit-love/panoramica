import React, { useCallback } from "react";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";
import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";
import Filter from "src/components/domains/feed/Filter";

export default function Filters({
  project,
  propertyNames,
  where: parentWhere,
  filters,
  setFilters,
  selectClassName,
  capitalNames = true,
}) {
  const where = parentWhere.AND.filter((name) =>
    ["source", "sourceChannel"].includes(name)
  ).reduce((acc, object) => {
    return { ...acc, ...object };
  }, {});

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

  return (
    <div className="flex flex-wrap">
      {propertyFilters.map(({ name, values }) => (
        <div key={name} className="mb-1 mr-2">
          <Filter
            key={name}
            name={name}
            values={values}
            onChange={onChange}
            selectClassName={selectClassName}
            capitalNames={capitalNames}
          />
        </div>
      ))}
    </div>
  );
}
