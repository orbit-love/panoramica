import c from "lib/common";

export const defaultEdgeStyle = {
  stroke: c.indigo800,
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
    stroke: c.selectedColor,
    shadowColor: "",
    lineWidth: 2,
  },
  inactive: {
    ...defaultEdgeStyle,
  },
};
