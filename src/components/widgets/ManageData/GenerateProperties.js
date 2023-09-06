import React from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import Loader from "src/components/domains/ui/Loader";
import ManageProperty from "./ManageProperty";
import utils from "src/utils";
import ConversationItem from "./ConversationItem";
import GetConversationsWhereQuery from "src/graphql/queries/GetConversationsWhere.gql";

export default function GenerateProperties({ project }) {
  const yamlPropertyName = "example.yaml";
  const [activities, setActivities] = React.useState([]);
  const [trigger, setTrigger] = React.useState(0);

  const where = { AND: [] };
  where.AND.push({
    node: { descendantsAggregate: { count_GTE: 5 } },
  });

  const projectId = project.id;
  const { loading } = useQuery(GetConversationsWhereQuery, {
    variables: {
      projectId,
      where,
      first: 5,
    },
    onCompleted: (data) => {
      const {
        projects: [
          {
            activitiesConnection: { edges },
          },
        ],
      } = data;
      const activities = edges.map(({ node }) => node);
      setActivities(activities);
    },
  });

  const yamlProperty = utils.getProperty(yamlPropertyName, project);
  const yaml = yamlProperty?.value;

  const processAll = React.useCallback(async () => {
    setTrigger((t) => t + 1);
  }, []);

  return (
    <div className="inline-flex-col space-y-2">
      <div className="text-tertiary font-light">Generate Properties</div>
      {loading && <Loader />}
      <ManageProperty propertyName={yamlPropertyName} project={project} />
      <div className="h-4" />
      <div className="text-tertiary font-light">
        Generate Properties Based on YAML
      </div>
      <table className="border-spacing-y-3 table w-1/2 whitespace-nowrap border-separate">
        <tbody>
          {activities.map((activity) => (
            <ConversationItem
              key={activity.id}
              activity={activity}
              setActivities={setActivities}
              project={project}
              yaml={yaml}
              trigger={trigger}
            />
          ))}
        </tbody>
      </table>
      <div>
        <button className="btn" onClick={processAll}>
          Process All
        </button>
      </div>
    </div>
  );
}
