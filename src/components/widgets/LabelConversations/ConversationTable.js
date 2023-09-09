import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import utils from "src/utils";
import ConversationItem from "./ConversationItem";
import GetConversationsWhereQuery from "src/graphql/queries/GetConversationsWhere.gql";
import GetConversationsCountQuery from "src/graphql/queries/GetConversationsCount.gql";
import Filter from "src/components/domains/feed/Filter";
import Loader from "src/components/domains/ui/Loader";
import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";
import DeleteActivityProperty from "./DeleteActivityProperty";

export default function ConversationTable({
  project,
  propertyNames,
  yaml,
  controlledProperties,
}) {
  const pageSize = 10;
  const [activities, setActivities] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [trigger, setTrigger] = React.useState(0);
  const [filters, setFilters] = React.useState([]);
  const [limit, setLimit] = React.useState(pageSize);
  const [offset, setOffset] = React.useState(0);
  const [propertyFilters, setPropertyFilters] = React.useState([]);
  const [selectAllCheckboxValue, setSelectAllCheckboxValue] =
    React.useState(false);
  const [totalCount, setTotalCount] = React.useState(null);

  const projectId = project.id;

  const { refetch: refetchFilters } = useQuery(GetPropertyFiltersQuery, {
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

  const where = { AND: [] };
  where.AND.push({
    isConversation: true,
  });
  const filtersWhere = filters.map(({ name, value }) => ({
    properties: {
      name,
      value,
    },
  }));
  where.AND.push(...filtersWhere);

  const { loading, refetch } = useQuery(GetConversationsWhereQuery, {
    notifyOnNetworkStatusChange: true, // so that loading is true on refetch
    variables: {
      projectId,
      where,
      limit,
      offset,
    },
    onCompleted: (data) => {
      const {
        projects: [{ activities }],
      } = data;
      setActivities(utils.updateActivitiesNew(activities));
    },
  });

  const { refetch: refetchTotalCount } = useQuery(GetConversationsCountQuery, {
    notifyOnNetworkStatusChange: true, // so that loading is true on refetch
    variables: {
      projectId,
      where,
    },
    onCompleted: (data) => {
      const {
        projects: [
          {
            activitiesAggregate: { count },
          },
        ],
      } = data;
      setTotalCount(count);
    },
  });

  // sends a message to children that they should process
  // the child's job is to determine if it is selected or not
  const processAll = React.useCallback(async () => {
    setTrigger((t) => t + 1);
  }, []);

  const updateCheckboxes = React.useCallback(
    (selectAllCheckboxValue) => {
      if (selectAllCheckboxValue) {
        setSelectedRows(activities.map(({ id }) => id));
      } else {
        setSelectedRows([]);
      }
    },
    [activities, setSelectedRows]
  );

  React.useEffect(() => {
    updateCheckboxes(selectAllCheckboxValue);
  }, [selectAllCheckboxValue, updateCheckboxes]);

  const onChangeFilter = React.useCallback(
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

  const refetchAll = React.useCallback(() => {
    refetch();
    refetchTotalCount();
    refetchFilters();
  }, [refetch, refetchTotalCount, refetchFilters]);

  const hasPreviousPage = offset > 0;
  const hasNextPage = offset + activities.length < totalCount;

  return (
    <div className="flex flex-col space-y-2">
      <div className="-pl-6 flex items-center pr-2 space-x-2">
        <div className="grow" />
        {loading && <Loader />}
        {selectedRows.length > 0 && (
          <div className="flex items-center space-x-2">
            <button className="btn !text-sm" onClick={processAll}>
              Label
            </button>
            <div>{selectedRows.length} selected</div>
          </div>
        )}
        <div>
          <button
            className="underline"
            onClick={() => {
              refetchAll();
            }}
          >
            Refresh
          </button>
        </div>
        <div></div>
        {totalCount > 0 && activities.length > 0 && (
          <div>
            Showing {offset + 1} - {offset + activities.length} of {totalCount}
          </div>
        )}
        {hasPreviousPage && (
          <>
            <button
              className="underline"
              onClick={() => {
                setSelectAllCheckboxValue(0);
                setSelectedRows([]);
                setOffset(0);
              }}
            >
              First
            </button>
            <button
              className="underline"
              onClick={() => {
                setSelectAllCheckboxValue(0);
                setSelectedRows([]);
                setOffset((offset) => offset - pageSize);
              }}
            >
              Previous
            </button>
          </>
        )}
        {hasNextPage && (
          <button
            className="underline"
            onClick={() => {
              setSelectAllCheckboxValue(0);
              setSelectedRows([]);
              setOffset((offset) => offset + pageSize);
            }}
          >
            Next
          </button>
        )}
        <div></div>
        <div className="flex space-x-1">
          {[10, 25, 100, 500].map((value) => (
            <React.Fragment key={value}>
              {limit === value && <div className="font-semibold">{value}</div>}
              {limit !== value && (
                <button
                  className="underline"
                  onClick={() => {
                    setSelectedRows([]);
                    setLimit(value);
                  }}
                >
                  {value}
                </button>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      <div className="py-2">
        <table className="table min-w-[100%] h-[80vh] text-sm overflow-y-auto">
          <thead>
            <tr className="font-semibold text-left">
              <th className="p-2">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    setSelectAllCheckboxValue(e.target.checked);
                  }}
                  checked={selectAllCheckboxValue}
                />
              </th>
              <th className="p-2">Conversation</th>
              {controlledProperties.map(({ name }) => (
                <td className="p-2" key={name}>
                  <div>{name.split(".").slice(-1)}</div>
                </td>
              ))}
              {propertyFilters.map(({ name, values }) => {
                return (
                  <th className="p-2 whitespace-nowrap" key={name}>
                    <div className="flex items-center space-x-2">
                      <Filter
                        name={name}
                        values={values}
                        onChange={(e) => onChangeFilter(e, name)}
                        selectClassName={"w-48"}
                        capitalNames={false}
                      />
                      <DeleteActivityProperty
                        propertyName={name}
                        project={project}
                        onComplete={() => {
                          refetchFilters();
                        }}
                      />
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="h-[70vh] overflow-y-auto">
            {activities.map((activity) => (
              <ConversationItem
                key={activity.id}
                activity={activity}
                setActivities={setActivities}
                project={project}
                yaml={yaml}
                trigger={trigger}
                propertyFilters={propertyFilters}
                propertyNames={propertyNames}
                controlledProperties={controlledProperties}
                selectedRows={selectedRows}
                setSelectedRows={setSelectedRows}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
