import c from "lib/common";

export const defaultEdgeStyle = {
  stroke: c.indigo800,
  shadowColor: "",
  lineWidth: 1,
  opacity: c.graph.inactiveOpacity,
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
    stroke: c.indigo700,
    shadowColor: "",
    lineWidth: c.graph.edge.activeLineWidth,
    opacity: c.graph.activeOpacity,
  },
  inactive: {
    ...defaultEdgeStyle,
    opacity: c.graph.inactiveOpacity,
  },
};
