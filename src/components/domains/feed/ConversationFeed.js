import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import Paginator from "src/components/domains/feed/Paginator";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import Filters from "./Filters";
import FilterDisplay from "./FilterDisplay";

const findActivitiesConnectionEdges = ({
  projects: [
    {
      activitiesConnection: { edges, pageInfo },
    },
  ],
}) => {
  return [edges, pageInfo];
};

export default function ConversationFeed({
  project,
  query,
  variables,
  where = [],
  handlers,
  minimal,
  term,
  eachActivity,
  filterPropertyNames,
  findEdges = findActivitiesConnectionEdges,
  className = "border-t border-gray-300 dark:border-gray-700",
}) {
  const [first, setFirst] = useState(10);
  const [activities, setActivities] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);

  const toWhere = (filters) => {
    const filterList = filters.map(({ name, value }) => {
      return {
        node: {
          properties: {
            name,
            value,
          },
        },
      };
    });
    const whereList = where.map((predicate) => {
      return {
        node: predicate,
      };
    });
    return {
      AND: [...filterList, ...whereList],
    };
  };
  const whereInput = toWhere(filters);

  const { fetchMore } = useQuery(query, {
    variables: { ...variables, first, where: whereInput },
    onCompleted: (data) => {
      const [edges, pageInfo] = findEdges(data);
      setActivities(edges.map((edge) => edge.node));
      setPageInfo(pageInfo);
      setLoading(false);
    },
  });

  if (!eachActivity) {
    eachActivity = ({ activity, index }) => (
      <ConversationFeedItem
        project={project}
        key={activity.id}
        index={index}
        activity={activity}
        handlers={handlers}
        minimal={minimal}
        term={term}
      />
    );
  }

  useEffect(() => {
    setLoading(true);
    fetchMore({
      variables: {
        first,
      },
    });
  }, [first, fetchMore]);

  // keep only the first activity in a conversation
  const conversationIds = activities.map((a) => a.conversation.id);
  const filteredActivities = activities.filter((activity, index) => {
    return conversationIds.indexOf(activity.conversation.id) === index;
  });

  // take the first descendant property and write them into the
  // otherwise empty conversation object, this is an optimization to
  // work around an issue with hung queries
  const updatedActivities = filteredActivities.map((activity) => {
    return {
      ...activity,
      conversation: {
        ...activity.conversation.descendants[0],
        ...activity.conversation,
      },
    };
  });

  // transform an array of objects into a single object
  // with all the properties from each object

  const whereObject = where.reduce((acc, object) => {
    return { ...acc, ...object };
  }, {});

  return (
    <>
      {filterPropertyNames?.length > 0 && (
        <FilterDisplay
          project={project}
          where={whereObject}
          filters={filters}
          setFilters={setFilters}
          propertyNames={filterPropertyNames}
        />
      )}
      <div className={className}>
        <Paginator
          activities={updatedActivities}
          setFirst={setFirst}
          pageInfo={pageInfo}
          eachActivity={eachActivity}
          loading={loading}
        />
      </div>
    </>
  );
}
