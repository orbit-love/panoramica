import { colors, fonts } from "lib/graph/styles";
import c from "lib/common";

export const defaultNodeStyle = {
  fill: colors.indigo600,
  stroke: c.backgroundColor,
  lineWidth: 2,
};

export const defaultNode = {
  type: "circle",
  style: defaultNodeStyle,
  labelCfg: {
    style: {
      fontFamily: fonts.family,
      fontStyle: fonts.style,
      fontSize: 11,
      fill: c.whiteColor,
    },
  },
};

// labelCfg may not be supported here
export const nodeStateStyles = {
  selected: {
    lineWidth: 3,
    fill: c.backgroundColor,
    stroke: colors.indigo500,
    shadowColor: "",
    labelCfg: {
      style: {},
    },
  },
};

export const defaultEdgeStyle = {
  stroke: colors.indigo700,
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

export const defaultComboStyle = {
  fill: colors.slate900,
  stroke: colors.slate700,
  fillOpacity: 0.15,
  shadowColor: "",
};

// https://antv-g6.gitee.io/en/docs/api/Items/comboProperties
export const defaultCombo = {
  style: defaultComboStyle,
  labelCfg: {
    style: {
      fill: colors.slate200,
    },
  },
};

export const comboStateStyles = {
  selected: {
    fill: colors.slate400,
    stroke: colors.indigo500,
    lineWidth: 2,
    shadowColor: "",
  },
};
