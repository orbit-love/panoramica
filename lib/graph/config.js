import c from "lib/common";

const {
  activeStroke,
  defaultStroke,
  inactiveOpacity,
  activeOpacity,
  activeLineWidth,
} = c.graph.edge;

export const defaultEdgeStyle = {
  stroke: defaultStroke,
  shadowColor: "",
  lineWidth: 1,
  opacity: inactiveOpacity,
};

export const defaultEdge = {
  type: "linear",
  style: defaultEdgeStyle,
};

export const edgeStateStyles = {
  active: {
    stroke: activeStroke,
    shadowColor: "",
    lineWidth: activeLineWidth,
    opacity: activeOpacity,
  },
  inactive: {
    ...defaultEdgeStyle,
    opacity: inactiveOpacity,
  },
};
