import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import GetConversationsCountQuery from "src/graphql/queries/GetConversationsCount.gql";
import Loader from "src/components/domains/ui/Loader";
import TableBody from "./TableBody";
import TableHeader from "./TableHeader";
import ActionController from "./ActionController";

export default function ConversationTable({
  project,
  propertyNames,
  yamlPropertyName,
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
  const [loadingRows, setLoadingRows] = React.useState([]);
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
  const [refetchNow, setRefetchNow] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [sort, setSort] = React.useState({ timestampInt: "DESC" });
  const projectId = project.id;
  const childProps = {
    project,
    projectId,
    propertyNames,
    yaml,
    yamlPropertyName,
    controlledProperties,
    activities,
    setActivities,
    selectedRows,
    setSelectedRows,
    loadingRows,
    setLoadingRows,
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
    refetchNow,
    setRefetchNow,
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
        <ActionController {...childProps} />
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
  refetchNow,
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

  React.useEffect(() => {
    if (refetchNow) {
      refetch();
    }
  }, [refetchNow, refetch]);

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
