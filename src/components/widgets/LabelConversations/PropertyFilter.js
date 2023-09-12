import React from "react";
import classnames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import DeleteConversationProperty from "./DeleteConversationProperty";

export default function PropertyFilter({
  project,
  name,
  displayName = name,
  values,
  filters: parentFilters,
  setFilters: setParentFilters,
  defaultWhereClauses,
  setWhere,
  refetch,
}) {
  const [expanded, setExpanded] = React.useState(false);
  const [filters, setFilters] = React.useState([]);
  const [selectedFilter, setSelectedFilter] = React.useState("Equals");
  const [filterValue, setFilterValue] = React.useState("");

  const parentFiltersRef = React.useRef(parentFilters);
  React.useEffect(() => {
    parentFiltersRef.current = parentFilters;
  }, [parentFilters]);

  const updateFilters = React.useCallback(
    (filters) => {
      setFilters(filters);

      const newParentFilters = parentFiltersRef.current
        .filter(({ name }) => name !== name)
        .concat(
          filters.map(({ type, value }) => ({
            name,
            type,
            value,
          }))
        );
      setParentFilters(newParentFilters);

      const filtersWhere = newParentFilters.map(({ name, type, value }) => {
        switch (type) {
          case "Equals":
            return { properties: { name, value } };
          case "Not Equals":
            return { properties_NONE: { name, value } };
          case "Contains":
            return { properties: { name, value_CONTAINS: value } };
          case "Exists":
            return { properties: { name } };
          case "Not Exists":
            return { properties_NONE: { name } };
        }
      });

      setWhere(() => ({
        AND: [...defaultWhereClauses, ...filtersWhere],
      }));
    },
    [name, setParentFilters, setWhere, defaultWhereClauses]
  );

  const addFilter = React.useCallback(() => {
    if (
      selectedFilter &&
      (filterValue ||
        selectedFilter === "Exists" ||
        selectedFilter === "Not Exists")
    ) {
      const newFilters = [
        ...filters,
        { type: selectedFilter, value: filterValue },
      ];
      updateFilters(newFilters);
      setFilterValue("");
      setSelectedFilter("Equals");
    }
  }, [selectedFilter, filterValue, filters, updateFilters]);

  const removeFilter = React.useCallback(
    (index) => {
      const newFilters = filters.filter((_, i) => i !== index);
      updateFilters(newFilters);
      setFilterValue("");
      setSelectedFilter("Equals");
    },
    [filters, updateFilters]
  );

  const enabledAddButton =
    selectedFilter &&
    (filterValue ||
      selectedFilter === "Exists" ||
      selectedFilter === "Not Exists");

  return (
    <div className="relative">
      <div
        onClick={() => setExpanded((expanded) => !expanded)}
        className={classnames("py-2 px-4 whitespace-nowrap cursor-pointer", {
          "bg-blue-100 dark:bg-blue-900": expanded,
          "hover:dark:bg-gray-800 hover:bg-gray-100": !expanded,
        })}
      >
        <div
          className={classnames("select-none text-xs", {
            "text-blue-500": filters.length > 0,
          })}
        >
          {displayName}
        </div>
      </div>
      {expanded && (
        <div className="font-normal absolute left-[-50%] top-8 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-700 min-w-[300px] z-50">
          <div className="absolute top-2 right-2">
            <FontAwesomeIcon
              icon="times"
              onClick={() => setExpanded(false)}
              className="cursor-pointer"
            />
          </div>
          <div className="flex flex-col p-3 pr-6 space-y-4">
            {filters.length > 0 && (
              <div>
                <ul>
                  {filters.map((filter, index) => (
                    <li key={index}>
                      <span className="font-semibold">{filter.type}</span>:{" "}
                      {filter.value.toString()}{" "}
                      <button onClick={() => removeFilter(index)}>
                        <FontAwesomeIcon
                          className="text-red-500"
                          icon="times"
                        />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex space-x-2">
              <select
                value={selectedFilter || ""}
                onChange={(e) => setSelectedFilter(e.target.value)}
              >
                <option value="Equals">Equals</option>
                <option value="Not Equals">Not Equals</option>
                <option value="Contains">Contains</option>
                <option value="Exists">Exists</option>
                <option value="Not Exists">Not Exists</option>
              </select>
              {(selectedFilter === "Equals" ||
                selectedFilter === "Not Equals") && (
                <select
                  value={filterValue}
                  onChange={(e) => setFilterValue(e.target.value)}
                  className="max-w-[200px]"
                >
                  <option value="">Select value</option>
                  {values.map(({ value }, index) => (
                    <option key={index} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              )}
              {selectedFilter === "Contains" && (
                <div>
                  <input
                    type="text"
                    value={filterValue}
                    required
                    onChange={(e) => setFilterValue(e.target.value)}
                  />
                </div>
              )}
              <button
                onClick={addFilter}
                className={classnames("btn !text-sm", {
                  "!bg-fuchsia-800": enabledAddButton,
                  "!bg-gray-400": !enabledAddButton,
                })}
                disabled={!enabledAddButton}
              >
                Add
              </button>
              <div className="flex-1" />
            </div>
          </div>
          <div className="flex justify-end p-2">
            <DeleteConversationProperty
              propertyName={name}
              project={project}
              onComplete={() => {
                refetch();
              }}
            >
              <span className="text-red-500">delete</span>
            </DeleteConversationProperty>
          </div>
        </div>
      )}
    </div>
  );
}
