import React, { useCallback, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WidgetContext } from "src/components/context/WidgetContext";

export default function SimilarAction({ conversation, className }) {
  const { addWidget } = useContext(WidgetContext);
  const onClickSimilarConversations = useCallback(async () => {
    const titleProperty = conversation.properties.find(
      (property) => property.name === "title"
    );
    var title =
      titleProperty?.value || conversation.descendants[0].text.slice(0, 50);
    addWidget(`similar-${conversation.id}`, "Similar", {
      title,
      conversation,
    });
  }, [conversation, addWidget]);

  return (
    <button
      title="Find similar conversations"
      onClick={onClickSimilarConversations}
      className={className}
    >
      <FontAwesomeIcon icon="magic-wand-sparkles" />
    </button>
  );
}
