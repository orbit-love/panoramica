import c from "lib/common";

const commonNodeStyles = {
  lineWidth: 0,
  stroke: c.backgroundColor,
  cursor: "pointer",
  shadowColor: "",
};

const helper = {
  getData: ({ community, levels }) => {
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
    var nodes = community.members.map((member) => {
      const { id } = member;
      const levelNumber = member.level;
      const size = levelSizes[levelNumber];
      const fontSize = levelFontSizes[levelNumber];
      var slicedName = member.actorName.slice(0, labelLength[levelNumber]);
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

    const toId = (actor) => actor && `id-${actor.replace(/[^a-z0-9\-]/gi, "")}`;
    var edges = [];
    community.members.forEach((member) => {
      const { id } = member;
      for (const [key, value] of Object.entries(member.connections)) {
        const connectedMember = community.members.find(
          (member) => member.globalActor === key || member.actor === key
        );
        // don't create edges to nodes that won't exist
        if (connectedMember) {
          const [outgoing, incoming] = value;
          if (incoming > 0) {
            edges.push({
              // label: `From ${toId(key)} to ${member.id}`,
              source: toId(key),
              target: id,
              weight: incoming,
            });
          }
          if (outgoing > 0) {
            edges.push({
              // label: `From ${member.id} to ${toId(key)}`,
              source: id,
              target: toId(key),
              weight: outgoing,
            });
          }
        }
      }
    });
    return { nodes, edges };
  },
};

export default helper;
