import React, { useEffect, useState } from "react";
import c from "lib/common";
import Graph from "components/graph";

const getData = ({ members, selection }) => {
  var nodes = members.list.map((member) => {
    // const selected = member.id === selection?.id;
    const { id } = member;
    const size = 17 + (5 - member.level.number) * 20;
    const label =
      size > 40 ? member.name : member.name.slice(0, 2).toUpperCase();
    var color;
    switch (member.level.number) {
      case 1:
        color = c.indigo600;
        break;
      case 2:
        color = c.indigo700;
        break;
      case 3:
        color = c.indigo800;
        break;
      case 4:
        color = c.indigo900;
        break;
    }
    return {
      id,
      label,
      member,
      size,
      style: {
        fill: color,
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
  graph,
  setGraph,
}) {
  const [data, setData] = useState(getData({ members, selection }));

  const eventHandlers = {
    "node:click": ({ item }) => setSelection(item.getModel().member),
    "canvas:click": () => setSelection(null),
    nodeselectchange: ({ target }) => {
      console.log(target.getModel());
    },
  };

  useEffect(() => {
    setData(getData({ members, selection }));
  }, [members, selection]);

  return (
    <Graph
      graph={graph}
      setGraph={setGraph}
      data={data}
      width={width}
      height={height}
      eventHandlers={eventHandlers}
    />
  );
}
