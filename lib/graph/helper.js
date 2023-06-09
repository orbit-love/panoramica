import c from "lib/common";

const commonNodeStyles = {
  lineWidth: 0,
  stroke: c.backgroundColor,
  cursor: "pointer",
  shadowColor: "",
};

const helper = {
  getData: ({ members, levels }) => {
    const {
      levelSizes,
      levelFontSizes,
      labelLength,
      labelColors,
      fontWeight,
      activeOpacity,
      inactiveOpacity,
      activeStroke,
      activeLineWidth,
      selectedStroke,
      selectedLineWidth,
    } = c.graph.node;
    var nodes = members.list.map((member) => {
      const { id } = member;
      const levelNumber = member.level;
      const size = levelSizes[levelNumber];
      const fontSize = levelFontSizes[levelNumber];
      var slicedName = member.name.slice(0, labelLength[levelNumber]);
      if (labelLength[levelNumber] < 2) {
        slicedName = slicedName.toUpperCase();
      }

      // default to no label since it's not selected
      const label = levelNumber < 4 ? slicedName : "";
      const level = levels[levelNumber];
      var color = c.orbitLevelColorScale(levelNumber);
      var labelColor = labelColors[levelNumber];
      return {
        id,
        label,
        member,
        slicedName,
        level,
        size,
        style: {
          ...commonNodeStyles,
          fill: color,
          opacity: inactiveOpacity,
        },
        labelCfg: {
          style: {
            fontSize,
            fontWeight,
            fill: labelColor,
          },
        },
        stateStyles: {
          active: {
            ...commonNodeStyles,
            fill: color,
            opacity: activeOpacity,
            stroke: activeStroke,
            lineWidth: activeLineWidth,
          },
          selected: {
            ...commonNodeStyles,
            fill: color,
            stroke: selectedStroke,
            lineWidth: selectedLineWidth,
            opacity: activeOpacity,
          },
          inactive: {
            ...commonNodeStyles,
            fill: color,
            opacity: inactiveOpacity,
          },
        },
      };
    });
    var edges = [];
    members.list.forEach((member) => {
      member.connections.forEach((connection) => {
        edges.push({
          source: member.id,
          target: connection.id,
        });
      });
    });
    return { nodes, edges };
  },
};

export default helper;
