export const DEFAULT_CONVERSATIONS_SCHEMA = {
  enable_nested_fields: true,
  fields: [
    {
      name: "text",
      type: "string",
      facet: false,
    },
    {
      name: "actors",
      type: "string[]",
      facet: true,
    },
    {
      name: "textLength",
      type: "int32",
      facet: false,
      optional: true,
    },
    {
      name: "activityCount",
      type: "int32",
      facet: false,
      optional: true,
    },
    {
      name: "memberCount",
      type: "int32",
      facet: false,
      optional: true,
    },
    {
      name: "source",
      type: "string",
      facet: true,
    },
    {
      name: "sourceChannel",
      type: "string",
      facet: true,
      optional: true,
    },
    {
      name: "firstActivityTimestampInt",
      type: "int64",
      facet: false,
      sort: true,
    },
    {
      name: "lastActivityTimestampInt",
      type: "int64",
      facet: false,
      sort: true,
    },
    // dont index the string timestamps, they are just to make it easier
    // to see what's in the index and debug
    {
      name: "firstActivityTimestamp",
      type: "string",
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: "lastActivityTimestamp",
      type: "string",
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: "duration",
      type: "int32",
      optional: true,
      facet: false,
      sort: false,
      index: false,
    },
    {
      name: "properties.*",
      type: "auto",
    },
    {
      name: "properties.tags",
      type: "auto",
      facet: true,
    },
    {
      name: "properties.title",
      type: "auto",
    },
    {
      name: "viewObject",
      type: "string",
      index: false,
      optional: true,
    },
  ],
};

export const DEFAULT_QAS_SCHEMA = {
  fields: [
    {
      name: "question",
      type: "string",
      facet: false,
    },
    {
      name: "answer",
      type: "string",
      facet: false,
    },
    {
      name: "source_name",
      type: "string",
      facet: true,
      optional: true,
    },
    {
      name: "type",
      type: "string",
      facet: true,
    },
    {
      name: "reference_url",
      type: "string",
      facet: true,
      optional: true,
    },
    {
      name: "reference_title",
      type: "string",
      facet: false,
      optional: true,
    },
    {
      name: "reference_id",
      type: "string",
      facet: true,
      optional: true,
    },
    {
      name: "reference_timestamp",
      type: "int64",
      facet: false,
      index: false,
      optional: true,
    },
  ],
  embedding: ["question"],
};
