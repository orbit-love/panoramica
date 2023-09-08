export const DEFAULT_CONVERSATIONS_SCHEMA = {
  fields: [
    {
      name: "body",
      type: "string",
      facet: false,
    },
    {
      name: "actors",
      type: "string[]",
      facet: false,
    },
    {
      name: "body_length",
      type: "int32",
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: "activity_count",
      type: "int32",
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: "source",
      type: "string",
      facet: true,
    },
    {
      name: "source_channel",
      type: "string",
      facet: true,
      optional: true,
    },
    {
      name: "start_timestamp",
      type: "int64",
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: "duration",
      type: "int64",
      facet: false,
      index: false,
      optional: true,
    },
    {
      name: "end_timestamp",
      type: "int64",
      facet: false,
      index: false,
      optional: true,
    },
  ],
  embedding: ["body", "actors"],
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
