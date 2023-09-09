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
  const [where, setWhere] = React.useState({
    AND: [
      {
        isConversation: true,
      },
    ],
  });
  const [limit, setLimit] = React.useState(pageSize);
  const [offset, setOffset] = React.useState(0);
  const [propertyFilters, setPropertyFilters] = React.useState([]);
  const [selectAllCheckboxValue, setSelectAllCheckboxValue] =
    React.useState(false);
  const [totalCount, setTotalCount] = React.useState(null);
  const [refetches, setRefetches] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
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
    loading,
    setLoading,
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="-pl-6 flex items-center pr-2 space-x-2">
        <Actions {...childProps} />
        <div className="grow" />
        <Pagination {...childProps} />
      </div>
      <div className="py-2">
        <table className="table min-w-[100%] h-[80vh] text-sm overflow-y-auto">
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
      {selectedRows.length > 0 && (
        <div className="flex items-center space-x-2">
          <button className="btn !text-sm" onClick={processAll}>
            Label
          </button>
          <div>{selectedRows.length} selected</div>
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
}) => {
  const onChangeFilter = React.useCallback(
    (e, name) => {
      const { value } = e.target;
      const newFilters = filters.filter((filter) => filter.name !== name);
      if (value !== "all") {
        newFilters.push({ name, value });
      }
      setFilters(newFilters);

      const filtersWhere = newFilters.map(({ name, value }) => ({
        properties: {
          name,
          value,
        },
      }));
      setWhere(() => ({
        AND: [{ isConversation: true }, ...filtersWhere],
      }));
    },
    [filters, setFilters, setWhere]
  );

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
                    refetch();
                  }}
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
  ...props
}) => {
  const { loading: queryLoading, refetch } = useQuery(
    GetConversationsWhereQuery,
    {
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
