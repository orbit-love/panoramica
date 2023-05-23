import c from "lib/common";

const commonNodeStyles = {
  lineWidth: 1,
  stroke: c.backgroundColor,
  cursor: "pointer",
  shadowColor: "",
};

// for some reason setting fontFamily makes fontSize not register
const defaultNodeLabelCfg = {
  style: {
    // fontFamily:
    //   "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;",
    fontSize: 13,
    fill: c.whiteColor,
    cursor: "pointer",
  },
};

const inactiveNodeLabelCfg = {
  style: {
    // fontFamily:
    //   "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen-Sans, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif;",
    fontSize: 11,
    fill: c.indigo600,
    cursor: "pointer",
  },
};

// the default node is the same as inactive
export const defaultNodeStyle = {
  fill: c.indigo900,
  ...commonNodeStyles,
};

// this is not used when nodes have other states
export const defaultNode = {
  type: "circle",
  style: defaultNodeStyle,
  labelCfg: defaultNodeLabelCfg,
};

export const nodeStateStyles = {
  selected: {
    ...commonNodeStyles,
    fill: c.indigo400,
    stroke: c.indigo200,
  },
  active: {
    fill: c.indigo600,
    ...commonNodeStyles,
  },
  inactive: {
    ...defaultNodeStyle,
  },
};

export const defaultEdgeStyle = {
  stroke: c.indigo900,
  shadowColor: "",
  lineWidth: 1,
};

export const defaultEdge = {
  type: "linear",
  style: defaultEdgeStyle,
  labelCfg: {
    refY: 20,
    style: {
      fill: c.indigo100,
      stroke: c.backgroundColor,
      fontSize: 17,
    },
  },
};

export const edgeStateStyles = {
  active: {
    stroke: c.indigo400,
    shadowColor: "",
    lineWidth: 2,
  },
  inactive: {
    ...defaultEdgeStyle,
  },
  selected: {
    stroke: c.indigo400,
    shadowColor: "",
    lineWidth: 2,
  },
};
