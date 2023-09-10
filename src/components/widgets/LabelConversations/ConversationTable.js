import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import utils from "src/utils";
import ConversationItem from "./ConversationItem";
import GetConversationsWhereQuery from "src/graphql/queries/GetConversationsWhere.gql";
import GetConversationsCountQuery from "src/graphql/queries/GetConversationsCount.gql";
import Loader from "src/components/domains/ui/Loader";
import GetPropertyFiltersQuery from "src/graphql/queries/GetPropertyFilters.gql";
import PropertyFilter from "./PropertyFilter";

export default function ConversationTable({
  project,
  propertyNames,
  yaml,
  controlledProperties,
}) {
  const defaultWhereClauses = [
    {
      isConversation: true,
    },
  ];
  const pageSize = 10;
  const [activities, setActivities] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [trigger, setTrigger] = React.useState(0);
  const [filters, setFilters] = React.useState([]);
  const [where, setWhere] = React.useState({
    AND: defaultWhereClauses,
  });
  const [limit, setLimit] = React.useState(pageSize);
  const [offset, setOffset] = React.useState(0);
  const [propertyFilters, setPropertyFilters] = React.useState([]);
  const [selectAllCheckboxValue, setSelectAllCheckboxValue] =
    React.useState(false);
  const [totalCount, setTotalCount] = React.useState(null);
  const [refetches, setRefetches] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [sort, setSort] = React.useState({ timestampInt: "DESC" });
  const projectId = project.id;
  const childProps = {
    project,
    projectId,
    propertyNames,
    yaml,
    controlledProperties,
    activities,
    setActivities,
    selectedRows,
    setSelectedRows,
    trigger,
    setTrigger,
    filters,
    setFilters,
    pageSize,
    limit,
    setLimit,
    offset,
    setOffset,
    propertyFilters,
    setPropertyFilters,
    selectAllCheckboxValue,
    setSelectAllCheckboxValue,
    totalCount,
    setTotalCount,
    refetches,
    setRefetches,
    where,
    setWhere,
    defaultWhereClauses,
    sort,
    setSort,
    loading,
    setLoading,
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center pr-2 px-4 space-x-2 w-full">
        <Actions {...childProps} />
        <div className="grow" />
        <Pagination {...childProps} />
      </div>
      <div className="overflow-auto h-[calc(100vh-120px)]">
        <table className="text-sm table-auto">
          <TableHeader {...childProps} />
          <TableBody {...childProps} />
        </table>
      </div>
    </div>
  );
}

const Actions = ({
  activities,
  selectedRows,
  setSelectedRows,
  setTrigger,
  selectAllCheckboxValue,
  refetches,
}) => {
  const refetchAll = React.useCallback(() => {
    refetches.map((refetch) => refetch());
  }, [refetches]);

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

  return (
    <>
      <div>Actions:</div>
      {selectedRows.length > 0 && (
        <div className="flex items-center space-x-2">
          <button className="underline" onClick={processAll}>
            Label
          </button>
          <div className="text-gray-400">{selectedRows.length} selected</div>
        </div>
      )}
      <div>
        <button className="underline" onClick={refetchAll}>
          Refresh
        </button>
      </div>
    </>
  );
};

const Pagination = ({
  projectId,
  where,
  pageSize,
  offset,
  limit,
  setLimit,
  setOffset,
  activities,
  totalCount,
  setTotalCount,
  setSelectAllCheckboxValue,
  setSelectedRows,
  refetches,
  setRefetches,
  loading,
}) => {
  const hasPreviousPage = offset > 0;
  const hasNextPage = offset + activities.length < totalCount;

  const { refetch } = useQuery(GetConversationsCountQuery, {
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

  // if the refetches doesn't contain this refetch, add it
  React.useEffect(() => {
    if (!refetches.includes(refetch)) {
      setRefetches((refetches) => [...refetches, refetch]);
    }
  }, [refetch, refetches, setRefetches]);

  return (
    <div className="flex space-x-2">
      {loading && (
        <div>
          <Loader />
        </div>
      )}
      <div></div>
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
      {totalCount > 0 && activities.length > 0 && (
        <div>
          Showing {offset + 1} - {offset + activities.length} of {totalCount}
        </div>
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
      {hasNextPage && (
        <button
          className="underline"
          onClick={() => {
            setSelectAllCheckboxValue(0);
            setSelectedRows([]);
            setOffset(Math.floor(totalCount / pageSize) * pageSize);
          }}
        >
          Last
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
  );
};

const TableHeader = ({
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
  refetches,
  setRefetches,
  setWhere,
  defaultWhereClauses,
}) => {
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

  // if the refetches doesn't contain this refetch, add it
  React.useEffect(() => {
    if (!refetches.includes(refetch)) {
      setRefetches((refetches) => [...refetches, refetch]);
    }
  }, [refetch, refetches, setRefetches]);

  return (
    <thead>
      <tr className="text-left bg-gray-50 border-b border-gray-200 dark:bg-gray-900 dark:border-gray-700">
        <th className="p-2">
          <div className="pl-2">
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
};

const TableBody = ({
  projectId,
  where,
  limit,
  offset,
  activities,
  setActivities,
  refetches,
  setRefetches,
  setLoading,
  sort,
  ...props
}) => {
  const { loading: queryLoading, refetch } = useQuery(
    GetConversationsWhereQuery,
    {
      notifyOnNetworkStatusChange: true, // so that loading is true on refetch
      variables: {
        projectId,
        where,
        sort,
        limit,
        offset,
      },
      onCompleted: (data) => {
        const {
          projects: [{ activities }],
        } = data;
        setActivities(utils.updateActivitiesNew(activities));
      },
    }
  );

  React.useEffect(() => {
    setLoading(queryLoading);
  }, [queryLoading, setLoading]);

  // if the refetches doesn't contain this refetch, add it
  React.useEffect(() => {
    if (!refetches.includes(refetch)) {
      setRefetches((refetches) => [...refetches, refetch]);
    }
  }, [refetch, refetches, setRefetches]);

  return (
    <tbody className="h-[70vh] overflow-y-auto">
      {activities.map((activity) => (
        <ConversationItem
          key={activity.id}
          activity={activity}
          setActivities={setActivities}
          {...props}
        />
      ))}
    </tbody>
  );
};
