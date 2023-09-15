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
    if (
      window.confirm(
        "This will delete this property for ALL conversations in the project and it will no longer appear in the table. Is that what you want to do?"
      )
    ) {
      deleteProperty();
    }
  }, [deleteProperty]);

  return (
    <button className="cursor-pointer" onClick={confirmDelete}>
      {children}
      {!children && (
        <FontAwesomeIcon icon="trash" className="text-sm cursor-pointer" />
      )}
    </button>
  );
}
