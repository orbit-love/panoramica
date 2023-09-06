import React, { useCallback } from "react";
import { useMutation } from "@apollo/client";

import UpdateProjectPropertyMutation from "src/graphql/mutations/UpdateProjectProperty.gql";
import utils from "src/utils";
import { ProjectDispatchContext } from "src/components/context/ProjectContext";

export default function ManageProperty({ propertyName, project }) {
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
      setMessage("Saved property!");
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
    },
    [value, dispatch, updateProjectProperty, project, propertyName]
  );

  return (
    <form onSubmit={saveProperty} className="inline-flex flex-col space-y-2">
      <h2 className="text-tertiary font-light">
        Manage Property: {propertyName}
      </h2>
      <textarea
        name="value"
        onChange={(e) => setValue(e.target.value)}
        className="h-64 w-[500px]"
        value={value}
      />
      <button className="btn" type="submit">
        Save
      </button>
      {message && <div className="text-green-500">{message}</div>}
    </form>
  );
}
