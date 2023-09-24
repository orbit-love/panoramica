import React from "react";
import { useMutation } from "@apollo/client";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import jsyaml from "js-yaml";

import { Frame, saveLayout } from "src/components/widgets";
import ConversationTable from "src/components/widgets/LabelConversations/ConversationTable";
import ManageProjectProperty from "src/components/widgets/LabelConversations/ManageProjectProperty";
import utils from "src/utils";
import Modal from "src/components/ui/Modal";

export default function LabelConversations({
  project,
  api,
  containerApi,
  params,
}) {
  const initialYamlPropertyName = params.yamlPropertyName;
  const [yamlPropertyName, setYamlPropertyName] = React.useState(
    initialYamlPropertyName
  );

  const updateYamlPropertyName = React.useCallback(
    (yamlPropertyName) => {
      api.updateParameters({ yamlPropertyName });
      saveLayout({ project, containerApi });
    },
    [project, api, containerApi]
  );

  React.useEffect(() => {
    updateYamlPropertyName(yamlPropertyName);
  }, [yamlPropertyName, updateYamlPropertyName]);

  return (
    <Frame fullWidth>
      <div className="flex overflow-x-scroll flex-col space-y-2 w-full">
        <div className="flex items-center px-4 pt-4 space-x-1 text-lg">
          <div className="text-tertiary text-lg font-light">
            Label Conversations
          </div>
          {yamlPropertyName && (
            <YamlPropertyEditor
              project={project}
              yamlPropertyName={yamlPropertyName}
              setYamlPropertyName={setYamlPropertyName}
            />
          )}
        </div>
        {!yamlPropertyName && (
          <ChoosePropertyName
            project={project}
            setYamlPropertyName={setYamlPropertyName}
          />
        )}
        {yamlPropertyName && (
          <WithProperyName
            project={project}
            yamlPropertyName={yamlPropertyName}
          />
        )}
      </div>
    </Frame>
  );
}

import CreateProjectPropertyMutation from "src/graphql/mutations/CreateProjectProperty.gql";
import { ProjectDispatchContext } from "src/components/context/ProjectContext";

const ChoosePropertyName = ({ project, setYamlPropertyName }) => {
  const dispatch = React.useContext(ProjectDispatchContext);
  const [propertyName, setPropertyName] = React.useState("");
  const yamlPropertyNames = project.properties.filter((p) =>
    p.name.endsWith(".yaml")
  );

  const [createProjectProperty] = useMutation(CreateProjectPropertyMutation, {
    variables: {
      projectId: project.id,
    },
  });

  const onSubmit = React.useCallback(
    async (e) => {
      e.preventDefault();
      const value = `name1: instruction1\nname2: instruction2\n`;
      await createProjectProperty({
        variables: {
          name: propertyName,
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
      setYamlPropertyName(propertyName);
    },
    [
      propertyName,
      setYamlPropertyName,
      createProjectProperty,
      project,
      dispatch,
    ]
  );
  return (
    <form className="p-4 space-y-4" onSubmit={onSubmit}>
      <div className="">Select a yaml for labeling conversations.</div>
      <div className="space-y-1">
        {yamlPropertyNames.map((p) => (
          <div key={p.name}>
            <button
              type="button"
              className="underline"
              onClick={() => setYamlPropertyName(p.name)}
            >
              {p.name}
            </button>
          </div>
        ))}
      </div>
      <div className="inline-flex space-x-2">
        <input
          type="text"
          value={propertyName}
          onChange={(e) => setPropertyName(e.target.value)}
        />
        <button type="submit" className="btn">
          new
        </button>
      </div>
    </form>
  );
};

const WithProperyName = ({ project, yamlPropertyName }) => {
  const yamlProperty = utils.getProperty(yamlPropertyName, project);
  var propertyNames = [];
  if (yamlProperty) {
    const yamlDoc = jsyaml.load(yamlProperty.value);
    propertyNames = Object.keys(yamlDoc);
  }
  const controlledProperties = [
    {
      name: `${yamlPropertyName}.status`,
      values: ["show", "pin", "dismiss"],
    },
  ];
  return (
    <ConversationTable
      project={project}
      yaml={yamlProperty?.value}
      yamlPropertyName={yamlPropertyName}
      propertyNames={propertyNames}
      controlledProperties={controlledProperties}
    />
  );
};

const YamlPropertyEditor = ({
  yamlPropertyName,
  setYamlPropertyName,
  project,
}) => {
  const [expanded, setExpanded] = React.useState(false);

  return (
    <>
      <div className="flex space-x-1">
        <div>{" / "}</div>
        <div
          onClick={() => setExpanded(true)}
          className="cursor-pointer hover:underline"
        >
          {yamlPropertyName}
        </div>
      </div>
      <div onClick={() => setYamlPropertyName(null)}>
        <FontAwesomeIcon icon="times" className="ml-2 text-sm cursor-pointer" />
      </div>
      {expanded &&
        createPortal(
          <Modal
            title={`Edit ${yamlPropertyName}`}
            close={() => setExpanded(false)}
            fullHeight
          >
            <div className="p-6 w-full h-full">
              <ManageProjectProperty
                propertyName={yamlPropertyName}
                project={project}
                onSave={() => {
                  setExpanded(false);
                }}
              />
            </div>
          </Modal>,
          document.body
        )}
    </>
  );
};
