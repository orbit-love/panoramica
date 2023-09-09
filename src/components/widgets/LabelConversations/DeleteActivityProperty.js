import React, { useCallback } from "react";
import { useMutation } from "@apollo/client";

import DeleteActivityPropertyMutation from "src/graphql/mutations/DeleteActivityProperty.gql";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function DeleteAllActivityProperties({
  propertyName,
  project,
  onComplete,
}) {
  const projectId = project.id;

  const [deleteActivityProperty] = useMutation(DeleteActivityPropertyMutation, {
    variables: {
      projectId,
      name: propertyName,
    },
  });

  const deleteProperty = useCallback(
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

  return (
    <button onClick={() => deleteProperty()}>
      <FontAwesomeIcon icon="trash" className="text-sm cursor-pointer" />
    </button>
  );
}
