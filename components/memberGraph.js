import React, { useEffect, useState, useRef } from "react";
import c from "lib/common";
import { colors } from "lib/graph/styles";
import Graph from "components/graph";

const getData = ({ members, selection }) => {
  var nodes = members.list.map((member) => {
    const selected = member.id === selection?.id;
    return {
      id: member.id,
      label: member.name,
      member: member,
      size: 17 + (5 - member.level.number) * 15,
      style: {
        fill: selected ? c.selectedColor : colors.indigo600,
      },
      // need to do styles in here!
      labelCfg: {
        style: {
          fill: selected ? c.backgroundColor : c.whiteColor,
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
};

export default function MemberGraph({
  width,
  height,
  members,
  selection,
  setSelection,
}) {
  const [data, setData] = useState(getData({ members, selection }));

  useEffect(() => {
    setData(getData({ members, selection }));
  }, [members, selection]);

  return (
    <Graph
      data={data}
      width={width}
      height={height}
      onNodeClick={({ item }) => setSelection(item.getModel().member)}
    />
  );
}
