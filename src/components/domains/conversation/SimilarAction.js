import React, { useCallback, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WidgetContext } from "src/components/context/WidgetContext";

export default function SimilarAction({ activity, className }) {
  const { addWidget } = useContext(WidgetContext);
  const onClickSimilarConversations = useCallback(async () => {
    const titleProperty = activity.properties.find(
      (property) => property.name === "title"
    );
    var title = titleProperty?.value || activity.text.slice(0, 50);
    addWidget(`similar-${activity.id}`, "Similar", {
      title,
      activity,
    });
  }, [activity, addWidget]);

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
