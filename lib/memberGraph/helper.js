import c from "lib/common";

const commonNodeStyles = {
  lineWidth: 0,
  stroke: c.backgroundColor,
  cursor: "pointer",
  shadowColor: "",
};

const labelColors = {
  1: c.purpleBgColor,
  2: c.purpleBgColor,
  3: c.indigo100,
  4: c.indigo100,
};

const base = 25;
const levelSizes = {
  1: base * 5,
  2: base * 3.5,
  3: base * 1.5,
  4: base,
};

const levelFontSizes = {
  1: 20,
  2: 17,
  3: 14,
  4: 9,
};

const labelLength = {
  1: 8,
  2: 8,
  3: 2,
  4: 1,
};

// by default, the node size changes by OL
const helper = {
  getData: ({ members }) => {
    var nodes = members.list.map((member) => {
      const { id } = member;
      const levelNumber = member.level.number;
      const size = levelSizes[levelNumber];
      const fontSize = levelFontSizes[levelNumber];
      const slicedName = member.name.slice(0, labelLength[levelNumber]);
      // default to no label since it's not selected
      const label = "";
      // var color = loveColors[member.love];
      var color = c.orbitLevelColorScale(member.level.number);
      var labelColor = labelColors[member.level.number];
      return {
        id,
        label,
        member,
        slicedName,
        level: member.level,
        reach: member.reach,
        love: member.love,
        size,
        style: {
          ...commonNodeStyles,
          fill: color,
          opacity: c.graph.inactiveOpacity,
        },
        labelCfg: {
          style: {
            fontSize,
            fontWeight: "600",
            fill: labelColor,
          },
        },
        stateStyles: {
          active: {
            ...commonNodeStyles,
            fill: color,
            opacity: c.graph.activeOpacity,
          },
          selected: {
            ...commonNodeStyles,
            fill: color,
            stroke: c.indigo700,
            lineWidth: c.graph.node.selectedLineWidth,
            opacity: c.graph.activeOpacity,
          },
          inactive: {
            ...commonNodeStyles,
            fill: color,
            opacity: c.graph.inactiveOpacity,
          },
        },
      };
    });
    var edges = [];
    members.connections.forEach((idPair) => {
      const [source, target] = idPair.split("-");
      edges.push({
        source,
        target,
      });
    });
    return { nodes, edges };
  },
};

export default helper;
