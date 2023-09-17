import React from "react";
import BaseFilter from "./BaseFilter";
import GetSourcesQuery from "src/components/widgets/Home/GetSources.gql";
import GetSourceChannelsQuery from "src/components/widgets/Source/GetSourceChannels.gql";
import { useQuery } from "@apollo/experimental-nextjs-app-support/ssr";

export function SourceAndChannelsFilter(props) {
  const [source, setSource] = React.useState("");
  return (
    <>
      <SourceFilter source={source} setSource={setSource} {...props} />
      {source && <SourceChannelsFilter source={source} {...props} />}
    </>
  );
}

function SourceFilter({
  project,
  setSource,
  filters,
  setFilters,
  setOpenFilter,
}) {
  const [values, setValues] = React.useState([]);

  useQuery(GetSourcesQuery, {
    variables: {
      projectId: project.id,
    },
    onCompleted: (data) => {
      var {
        projects: [{ sources }],
      } = data;
      setValues(
        sources.map(({ name, conversationCount }) => ({
          value: name,
          count: conversationCount,
        }))
      );
    },
  });

  // dont pass setOpenFilter so that the filter is not closed when the source changes
  const onChange = React.useCallback(
    ({ name, operation, value }) => {
      updateFiltersCallback({
        setFilters,
        toWhere: fieldToWhere,
      })({ name, operation, value });
      setSource(value);
    },
    [setFilters, setSource]
  );

  const initialValue = filters.find(({ name }) => name === "source")?.value;

  return (
    <BaseFilter
      name="source"
      displayName="Source"
      initialValue={initialValue}
      values={values}
      onChange={onChange}
      onClear={onClearCallback({ setOpenFilter, setFilters })}
    />
  );
}

function SourceChannelsFilter({
  project,
  source,
  filters,
  setFilters,
  setOpenFilter,
}) {
  const [values, setValues] = React.useState([]);

  useQuery(GetSourceChannelsQuery, {
    variables: {
      projectId: project.id,
      source,
    },
    onCompleted: (data) => {
      var {
        projects: [{ sourceChannels }],
      } = data;
      setValues(
        sourceChannels.map(({ name, conversationCount }) => ({
          value: name,
          count: conversationCount,
        }))
      );
    },
  });

  const initialValue = filters.find(
    ({ name }) => name === "sourceChannel"
  )?.value;

  return (
    <>
      {values.length > 0 && (
        <BaseFilter
          name="sourceChannel"
          displayName="Channel"
          initialValue={initialValue}
          values={values}
          onChange={updateFiltersCallback({
            setOpenFilter,
            setFilters,
            toWhere: fieldToWhere,
          })}
          onClear={onClearCallback({ setOpenFilter, setFilters })}
        ></BaseFilter>
      )}
    </>
  );
}

export function PropertyFilter({
  name,
  displayName,
  values,
  setFilters,
  setOpenFilter,
}) {
  return (
    <BaseFilter
      name={name}
      displayName={displayName}
      values={values}
      onChange={updateFiltersCallback({
        setOpenFilter,
        setFilters,
        toWhere: propertyToWhere,
      })}
      onClear={onClearCallback({ setOpenFilter, setFilters })}
    ></BaseFilter>
  );
}

const propertyToWhere = ({ name, operation, value }) => {
  switch (operation) {
    case "Equals":
      return { properties: { name, value } };
    case "Not Equals":
      return { properties_NONE: { name, value } };
    case "Contains":
      return { properties: { name, value_CONTAINS: value } };
    case "Exists":
      return { properties: { name } };
    case "Not Exists":
      return { properties_NONE: { name } };
  }
};

const fieldToWhere = ({ name, operation, value }) => {
  switch (operation) {
    case "Equals":
      return { [name]: value };
    case "Not Equals":
      return { [`${name}_NOT`]: value };
    case "Contains":
      return { [`${name}_CONTAINS`]: value };
    case "Exists":
      return { [name]: {} };
    case "Not Exists":
      return { NOT: { name } };
  }
};

const updateFiltersCallback =
  ({ setOpenFilter, setFilters, toWhere }) =>
  ({ name, operation, value }) => {
    setFilters((filters) =>
      filters
        .filter(({ name: filterName }) => filterName !== name)
        .concat({
          name,
          value,
          operation,
          where: toWhere({ name, operation, value }),
        })
    );
    setOpenFilter && setOpenFilter(null);
  };

const onClearCallback =
  ({ setOpenFilter, setFilters }) =>
  ({ name }) => {
    setFilters((filters) =>
      filters.filter(({ name: filterName }) => filterName !== name)
    );
    // this causes some strange behaviors, forego for now
    // setOpenFilter && setOpenFilter(null);
  };
