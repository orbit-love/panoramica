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
  embedding: ["body"],
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
      name: "page_title",
      type: "string",
      facet: false,
    },
    {
      name: "page_url",
      type: "string",
      facet: true,
      index: false,
      optional: true,
    },
    {
      name: "root_url",
      type: "string",
      facet: true,
      index: false,
      optional: true,
    },
  ],
  embedding: ["question", "answer"],
};
