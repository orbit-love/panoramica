import React, { useState, useEffect } from "react";
import Loader from "src/components/domains/ui/Loader";

export default function Paginator({
  conversations,
  eachConversation,
  setFirst,
  pageInfo,
  loading,
}) {
  const { hasNextPage } = pageInfo;
  const [lastElement, setLastElement] = useState(null);

  useEffect(() => {
    const currentElement = lastElement;
    const currentObserver = new IntersectionObserver((entries) => {
      const target = entries[0];
      if (target.isIntersecting) {
        if (hasNextPage) {
          setFirst((first) => first + 10);
        }
      }
    });

    if (currentElement) {
      currentObserver.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        currentObserver.unobserve(currentElement);
      }
    };
  }, [lastElement, hasNextPage, setFirst]);

  return (
    <>
      {conversations.map((conversation, index) => (
        <div key={conversation.id} ref={setLastElement}>
          {eachConversation({ conversation, index })}
        </div>
      ))}
      {!loading && !hasNextPage && <p className="my-6 text-center">♥</p>}
      {loading && (
        <div className="p-6 text-center">
          <Loader />
        </div>
      )}
    </>
  );
}
