import c from "lib/common";

const commonNodeStyles = {
  lineWidth: 1,
  stroke: c.backgroundColor,
  cursor: "pointer",
  shadowColor: "",
};

const loveColors = {
  1: c.indigo800,
  2: c.indigo400,
  3: c.indigo200,
};

const labelColors = {
  1: c.indigo300,
  2: c.indigo100,
  3: c.indigo600,
};

const base = 25;
const levelSizes = {
  1: base * 6,
  2: base * 4,
  3: base * 2,
  4: base,
};

const levelFontSizes = {
  1: 25,
  2: 19,
  3: 15,
  4: 9,
};

const labelLength = {
  1: 8,
  2: 8,
  3: 1,
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
      const label = member.name.slice(0, labelLength[levelNumber]);
      var color = loveColors[member.love];
      var labelColor = labelColors[member.love];
      return {
        id,
        label,
        member,
        reach: member.reach,
        love: member.love,
        level: levelNumber,
        size,
        style: {
          ...commonNodeStyles,
          fill: color,
        },
        labelCfg: {
          style: {
            fontSize,
            fill: labelColor,
          },
        },
        stateStyles: {
          active: {
            ...commonNodeStyles,
            fill: color,
            stroke: c.selectedColor,
          },
          selected: {
            ...commonNodeStyles,
            fill: color,
            stroke: c.selectedColor,
            lineWidth: 4,
          },
          inactive: {
            ...commonNodeStyles,
            fill: color,
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
