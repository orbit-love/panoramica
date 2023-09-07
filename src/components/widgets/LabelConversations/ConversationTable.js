import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import utils from "src/utils";
import ConversationItem from "./ConversationItem";
import GetConversationsWhereQuery from "src/graphql/queries/GetConversationsWhere.gql";
import Filters from "src/components/domains/feed/Filters";
import Loader from "src/components/domains/ui/Loader";

export default function ConversationTable({
  project,
  propertyNames,
  yaml,
  controlledProperties,
}) {
  const pageSize = 20;
  const [activities, setActivities] = React.useState([]);
  const [selectedRows, setSelectedRows] = React.useState([]);
  const [trigger, setTrigger] = React.useState(0);
  const [filters, setFilters] = React.useState([]);
  const [limit, setLimit] = React.useState(pageSize);
  const [offset, setOffset] = React.useState(0);

  const where = { AND: [] };
  where.AND.push({
    isConversation: true,
  });
  // todo: remove later, this is an example
  where.AND.push({
    properties_NOT: {
      name: "example.yaml.status",
      value: "dismiss",
    },
  });
  const filtersWhere = filters.map(({ name, value }) => ({
    properties: {
      name,
      value,
    },
  }));
  where.AND.push(...filtersWhere);

  const projectId = project.id;
  const { loading } = useQuery(GetConversationsWhereQuery, {
    variables: {
      projectId,
      where,
      limit,
      offset,
    },
    onCompleted: (data) => {
      const {
        projects: [{ activities: theActivities }],
      } = data;
      const activities = theActivities.filter(
        (activity) => activity.descendants.length > 0
      );
      setActivities(utils.updateActivitiesNew(activities));
    },
  });

  const processAll = React.useCallback(async () => {
    setTrigger((t) => t + 1);
  }, []);

  const onChangeCheckbox = React.useCallback(
    (e) => {
      const { checked } = e.target;
      if (checked) {
        setSelectedRows(activities.map(({ id }) => id));
      } else {
        setSelectedRows([]);
      }
    },
    [activities]
  );

  return (
    <div className="flex flex-col space-y-2">
      <div className="-pl-6 flex items-center pr-2 space-x-2">
        {propertyNames?.length > 0 && (
          <React.Suspense fallback={<div />}>
            <Filters
              project={project}
              where={[]}
              filters={filters}
              setFilters={setFilters}
              propertyNames={[
                ...controlledProperties.map(({ name }) => name),
                ...propertyNames,
              ]}
              selectClassName="w-36"
              capitalNames={false}
            />
          </React.Suspense>
        )}
        {selectedRows.length > 0 && (
          <div className="flex items-center space-x-2">
            <button className="btn mb-1" onClick={processAll}>
              Label
            </button>
            <div>{selectedRows.length} selected</div>
          </div>
        )}
        <div className="grow" />
        {loading && <Loader />}
        {offset > 0 && (
          <button
            onClick={() => {
              setOffset((offset) => offset - pageSize);
            }}
          >
            Previous
          </button>
        )}
        {true && (
          <button
            onClick={() => {
              setOffset((offset) => offset + pageSize);
            }}
          >
            Next
          </button>
        )}
      </div>
      <div className="h-[70vh] overflow-y-scroll py-2">
        <table className="table min-w-[100%] text-sm">
          <thead>
            <tr className="font-semibold text-left">
              <th className="p-2">
                <input type="checkbox" onChange={onChangeCheckbox} />
              </th>
              <th className="p-2">Conversation</th>
              {controlledProperties.map(({ name }) => (
                <td className="p-2" key={name}>
                  <div>{name.split(".").slice(-1)}</div>
                </td>
              ))}
              {propertyNames.map((propertyName) => {
                return (
                  <td className="p-2 whitespace-nowrap" key={propertyName}>
                    <div className="w-40">🔖 {propertyName}</div>
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {activities.map((activity) => (
              <ConversationItem
                key={activity.id}
                activity={activity}
                setActivities={setActivities}
                project={project}
                yaml={yaml}
                trigger={trigger}
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
