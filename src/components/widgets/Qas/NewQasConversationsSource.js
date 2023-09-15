import React from "react";
import GetSourcesQuery from "src/components/widgets/Home/GetSources.gql";
import GetSourceChannelsQuery from "src/components/widgets/Source/GetSourceChannels.gql";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

export default function NewQasConversationsSource({
  project,
  specificFields,
  onChange,
}) {
  const source = specificFields.source || "";
  const sourceChannel = specificFields.sourceChannel || "";
  const actors = specificFields.actors || "";

  const {
    data: {
      projects: [{ sources: fetchedSources }],
    },
  } = useSuspenseQuery(GetSourcesQuery, {
    variables: {
      projectId: project.id,
    },
  });

  const {
    data: {
      projects: [{ sourceChannels: fetchedSourceChannels }],
    },
  } = useSuspenseQuery(GetSourceChannelsQuery, {
    variables: {
      projectId: project.id,
      source,
    },
  });

  const sources = fetchedSources?.map(({ name }) => name);
  const sourceChannels = fetchedSourceChannels?.map(({ name }) => name);

  return (
    <>
      <div className="flex flex-col space-y-1">
        <label htmlFor="source">Conversations Source</label>
        <small>
          We&apos;ll only generate QAs using conversations from this source
        </small>

        <select
          name="source"
          value={source}
          onChange={(e) => onChange("source", e.target.value)}
        >
          <option>ANY</option>
          {sources &&
            sources.map((source, index) => (
              <option key={index} value={source}>
                {source}
              </option>
            ))}
        </select>
      </div>
      <div className="flex flex-col space-y-1">
        <label htmlFor="source-channel">Conversations Source Channel</label>
        <small>
          We&apos;ll only generate QAs using conversations from this channel
        </small>

        <select
          name="source-channel"
          value={sourceChannel}
          onChange={(e) => onChange("sourceChannel", e.target.value)}
        >
          <option>ANY</option>
          {sourceChannels &&
            sourceChannels.map((sourceChannel, index) => (
              <option key={index} value={sourceChannel}>
                {sourceChannel}
              </option>
            ))}
        </select>
      </div>

      <div className="flex flex-col space-y-1">
        <label htmlFor="actors">Actors</label>
        <small>
          We&apos;ll only generate QAs using conversations involving at least
          one of these actors &#40;comma separated list&#41;
        </small>

        <input
          name="actors"
          type="text"
          value={actors}
          onChange={(e) => onChange("actors", e.target.value)}
        ></input>
      </div>
    </>
  );
}
