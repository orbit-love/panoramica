import React from "react";
import classnames from "classnames";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";
import PropertyFilter from "./PropertyFilter";
import Loader from "src/components/domains/ui/Loader";

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
  yamlPropertyName,
  loadingRows,
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
      // remove any controlled properties for another project
      propertyFilters = propertyFilters.filter(({ name }) => {
        const theYamlPropertyName = nameIfControlled(name);
        if (theYamlPropertyName) {
          return theYamlPropertyName === yamlPropertyName;
        } else {
          return true;
        }
      });

      // if the propertyFilters are missing anything in controlledProperties, add it
      controlledProperties.forEach(({ name, values }) => {
        if (!propertyFilters.find((filter) => filter.name === name)) {
          propertyFilters.push({
            name,
            values,
          });
        }
      });

      // put any filters matching propertyNames first, then sort alphabetically
      propertyFilters.sort((a, b) => {
        const aNameIfControlled = nameIfControlled(a.name);
        const bNameIfControlled = nameIfControlled(b.name);
        if (aNameIfControlled && !bNameIfControlled) {
          return -1;
        }
        if (!aNameIfControlled && bNameIfControlled) {
          return 1;
        }

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
      <tr className="text-left bg-gray-50 border-y border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <th className="py-2 pl-4">
          <div className="flex justify-center">
            {loadingRows.length > 0 && <Loader />}
            <input
              type="checkbox"
              onChange={(e) => {
                setSelectAllCheckboxValue(e.target.checked);
              }}
              checked={selectAllCheckboxValue}
              className={classnames({ hidden: loadingRows.length > 0 })}
            />
          </div>
        </th>
        <th className="py-2 px-4 text-xs font-semibold">Conversation</th>
        {propertyFilters.map(({ name, values }) => {
          return (
            <th
              key={name}
              className="font-semibold border-x border-gray-200 dark:border-gray-700"
            >
              <PropertyFilter
                name={name}
                displayName={propertyDisplayName(name)}
                values={values}
                filters={filters}
                setFilters={setFilters}
                defaultWhereClauses={defaultWhereClauses}
                project={project}
                setWhere={setWhere}
                refetch={refetch}
              />
            </th>
          );
        })}
      </tr>
    </thead>
  );
}

const regex = /^(.*)\.([^\.]+)$/;
const nameIfControlled = (name) => {
  const match = name.match(regex);
  if (match) {
    return match[1];
  } else {
    return null;
  }
};

const propertyDisplayName = (name) => {
  const match = name.match(regex);
  if (match) {
    return match[2];
  } else {
    return name;
  }
};
