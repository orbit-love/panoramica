import React, { useCallback, useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { WidgetContext } from "src/components/context/WidgetContext";

export default function SimilarAction({ activity, className }) {
  const { addWidget } = useContext(WidgetContext);
  const onClickSimilarConversations = useCallback(async () => {
    var summary = activity.summary || activity.text.slice(0, 50);
    addWidget(`similar-${activity.id}`, "Similar", {
      title: `Similar to ${summary}`,
      activityId: activity.id,
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
