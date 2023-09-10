import React from "react";
import { useMutation } from "@apollo/client";

import DeleteActivityPropertyMutation from "src/graphql/mutations/DeleteActivityProperty.gql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DeleteAllActivityProperties({
  propertyName,
  project,
  onComplete,
  children,
}) {
  const projectId = project.id;

  const [deleteActivityProperty] = useMutation(DeleteActivityPropertyMutation, {
    variables: {
      projectId,
      name: propertyName,
    },
  });

  const deleteProperty = React.useCallback(
    async (value) => {
      await deleteActivityProperty({
        variables: {
          value,
        },
      });
      await onComplete();
    },
    [deleteActivityProperty, onComplete]
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
