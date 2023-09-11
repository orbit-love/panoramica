import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import Paginator from "src/components/domains/feed/Paginator";
import ConversationFeedItem from "src/components/domains/feed/ConversationFeedItem";
import FilterDisplay from "./FilterDisplay";

const findConversationsConnectionEdges = ({
  projects: [
    {
      conversationsConnection: { edges, pageInfo },
    },
  ],
}) => {
  return [edges, pageInfo];
};

export default function ConversationFeed({
  project,
  query,
  variables,
  where = { AND: [] },
  sort = { node: { lastActivityTimestamp: "DESC" } },
  handlers,
  term,
  eachConversation,
  filterPropertyNames,
  findEdges = findConversationsConnectionEdges,
  className = "border-t border-gray-300 dark:border-gray-700",
}) {
  const [first, setFirst] = useState(10);
  const [conversations, setConversations] = useState([]);
  const [pageInfo, setPageInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState([]);

  const mergeWhere = (filters) => {
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
    return {
      AND: [...filterList, ...where.AND],
    };
  };

  const { fetchMore } = useQuery(query, {
    variables: { ...variables, first, where: mergeWhere(filters), sort },
    onCompleted: (data) => {
      const [edges, pageInfo] = findEdges(data);
      setConversations(edges.map((edge) => edge.node));
      setPageInfo(pageInfo);
      setLoading(false);
    },
  });

  if (!eachConversation) {
    eachConversation = ({ conversation, index }) => (
      <ConversationFeedItem
        project={project}
        index={index}
        key={conversation.id}
        conversation={conversation}
        handlers={handlers}
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

  return (
    <>
      {filterPropertyNames?.length > 0 && (
        <FilterDisplay
          project={project}
          where={where}
          filters={filters}
          setFilters={setFilters}
          propertyNames={filterPropertyNames}
        />
      )}
      <div className={className}>
        <Paginator
          conversations={conversations}
          setFirst={setFirst}
          pageInfo={pageInfo}
          eachConversation={eachConversation}
          loading={loading}
        />
      </div>
    </>
  );
}
