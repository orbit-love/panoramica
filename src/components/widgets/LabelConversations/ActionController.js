import React from "react";

import { labelConversation } from "./actions";

export default function ActionController({
  project,
  conversations,
  setConversations,
  yaml,
  selectedRows,
  setSelectedRows,
  setLoadingRows,
  selectAllCheckboxValue,
  setSelectAllCheckboxValue,
  setRefetchNow,
}) {
  const processConversation = React.useCallback(
    async (conversation) => {
      setLoadingRows((loadingRows) => [...loadingRows, conversation.id]);
      const newConversation = await labelConversation({
        project,
        conversation,
        yaml,
      });
      setConversations((conversations) =>
        conversations.map((a) =>
          a.id === conversation.id ? newConversation : a
        )
      );
      setSelectedRows((selectedRows) =>
        selectedRows.filter((id) => id !== conversation.id)
      );
      setLoadingRows((loadingRows) =>
        loadingRows.filter((id) => id !== conversation.id)
      );
    },
    [project, yaml, setConversations, setSelectedRows, setLoadingRows]
  );

  // sends a message to children that they should process
  // the child's job is to determine if it is selected or not
  const labelSelectedConversations = async ({
    selectedConversations: objects,
    setSelectAllCheckboxValue,
    processConversation: processObject,
  }) => {
    let index = 0;
    let maxConcurrency = 3;
    let activePromises = [];

    async function handlePromise(promise) {
      await promise;
      activePromises = activePromises.filter(
        (activePromise) => activePromise !== promise
      );
    }

    while (index < objects.length || activePromises.length > 0) {
      while (activePromises.length < maxConcurrency && index < objects.length) {
        const promise = processObject(objects[index]);
        activePromises.push(promise);
        handlePromise(promise);
        index += 1;
      }

      if (activePromises.length > 0) {
        await Promise.race(activePromises);
      }
    }

    setSelectAllCheckboxValue(false);
  };

  const conversationsRef = React.useRef();

  React.useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  React.useEffect(() => {
    if (selectAllCheckboxValue) {
      setSelectedRows(conversationsRef.current.map(({ id }) => id));
    } else {
      setSelectedRows([]);
    }
  }, [selectAllCheckboxValue, setSelectedRows]);

  const selectedConversations = selectedRows.map((id) =>
    conversations.find((conversation) => conversation.id === id)
  );

  return (
    <>
      <div>Actions:</div>
      {selectedRows.length > 0 && (
        <div className="flex items-center space-x-2">
          <button
            className="underline"
            onClick={() =>
              labelSelectedConversations({
                selectedConversations,
                setSelectAllCheckboxValue,
                processConversation,
              })
            }
          >
            Label
          </button>
          <div className="text-gray-400">{selectedRows.length} selected</div>
        </div>
      )}
      <div>
        <button
          className="underline"
          onClick={() => setRefetchNow((refetchNow) => refetchNow + 1)}
        >
          Refresh
        </button>
      </div>
    </>
  );
}
