import React, { useCallback } from "react";
import { useMutation } from "@apollo/client";

import UpdateProjectPropertyMutation from "src/graphql/mutations/UpdateProjectProperty.gql";
import utils from "src/utils";
import { ProjectDispatchContext } from "src/components/context/ProjectContext";

export default function ManageProjectProperty({
  propertyName,
  project,
  onSave,
}) {
  const [message, setMessage] = React.useState("");
  const dispatch = React.useContext(ProjectDispatchContext);

  const property = utils.getProperty(propertyName, project);
  const projectId = project.id;
  const [value, setValue] = React.useState(property?.value);

  const [updateProjectProperty] = useMutation(UpdateProjectPropertyMutation, {
    variables: {
      projectId,
      name: propertyName,
    },
  });

  const saveProperty = useCallback(
    (e) => {
      e.preventDefault();
      updateProjectProperty({
        variables: {
          value,
        },
      });
      dispatch({
        type: "updateProject",
        project: {
          ...project,
          properties: [
            ...project.properties.filter((p) => p.name !== propertyName),
            {
              name: propertyName,
              value,
            },
          ],
        },
      });
      if (onSave) {
        onSave();
      } else {
        setMessage("Saved property!");
      }
    },
    [value, dispatch, updateProjectProperty, project, propertyName, onSave]
  );

  return (
    <form
      onSubmit={saveProperty}
      className="inline-flex flex-col space-y-2 w-full h-full"
    >
      <h2 className="text-tertiary font-light">
        Manage Property: {propertyName}
      </h2>
      <textarea
        name="value"
        onChange={(e) => setValue(e.target.value)}
        className="h-full"
        value={value}
      />
      <button className="btn" type="submit">
        Save
      </button>
      {message && <div className="text-green-500">{message}</div>}
    </form>
  );
}
