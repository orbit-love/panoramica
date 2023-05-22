import { colors, fonts } from "lib/graph/styles";
import c from "lib/common";

export const defaultNodeStyle = {
  fill: colors.indigo600,
  stroke: c.backgroundColor,
  lineWidth: 1,
  cursor: "pointer",
};

export const defaultNode = {
  type: "circle",
  style: defaultNodeStyle,
  labelCfg: {
    style: {
      fontFamily: fonts.family,
      fontStyle: fonts.style,
      fontSize: 12,
      fill: c.whiteColor,
    },
  },
};

// labelCfg may not be supported here
export const nodeStateStyles = {
  selected: {
    lineWidth: 3,
    fill: c.indigo400,
    stroke: c.indigo600,
    shadowColor: "",
    labelCfg: {
      style: {},
    },
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
      fill: colors.indigo100,
      stroke: c.backgroundColor,
      fontSize: 17,
    },
  },
};

export const edgeStateStyles = {
  selected: {
    stroke: c.indigo400,
    shadowColor: "",
    lineWidth: 2,
  },
};
