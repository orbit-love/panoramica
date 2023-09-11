import React from "react";
import { useMutation } from "@apollo/client";

import DeleteConversationPropertyMutation from "src/graphql/mutations/DeleteConversationProperty.gql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DeleteAllActivityProperties({
  propertyName,
  project,
  onComplete,
  children,
}) {
  const projectId = project.id;

  const [deleteConversationProperty] = useMutation(
    DeleteConversationPropertyMutation,
    {
      variables: {
        projectId,
        name: propertyName,
      },
    }
  );

  const deleteProperty = React.useCallback(
    async (value) => {
      await deleteConversationProperty({
        variables: {
          value,
        },
      });
      await onComplete();
    },
    [deleteConversationProperty, onComplete]
  );

  const confirmDelete = React.useCallback(() => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      deleteProperty();
    }
  }, [deleteProperty]);

  return (
    <div className="cursor-pointer" onClick={confirmDelete}>
      {children}
      {!children && (
        <FontAwesomeIcon icon="trash" className="text-sm cursor-pointer" />
      )}
    </div>
  );
}
