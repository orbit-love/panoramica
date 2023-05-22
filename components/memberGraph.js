import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";
import Graph from "components/graph";

const getData = ({ members }) => {
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
  prevWidth,
  prevHeight,
  members,
  selection,
  setSelection,
  graph,
  setGraph,
  showNetwork,
  setShowNetwork,
}) {
  const [data, setData] = useState(getData({ members, selection }));

  const eventHandlers = {
    "node:click": ({ item }) => setSelection(item.getModel().member),
    "node:dblclick": ({ newGraph, item }) => {
      newGraph.focusItem(item, true);
    },
    "canvas:click": () => setSelection(null),
  };

  useEffect(() => {
    setData(getData({ members }));
  }, [members]);

  useEffect(() => {
    // this causes the same old problems, if we had prevShowNetwork
    // we could possibly do it, the arrow keys do it and then this does
    if (selection && graph) {
      const node = graph.findById(selection.id);
      if (node && !node.hasState("selected")) {
        graph.emit("node:click", { item: node });
      }
      // always focus, just don't emit the click again
      graph.focusItem(node, true);
    }
  }, [graph, selection]);

  const graphWidth = width * 0.8;
  const graphHeight = height * 0.8;

  // the graphWidth + 5 prevents the canvas from overflowing the modal
  return (
    <div
      className={`absolute top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-[#0F0A25] bg-opacity-70 ${
        !showNetwork && "hidden"
      }`}
      onClick={(event) => {
        if (event.target === event.currentTarget) setShowNetwork(false);
      }}
    >
      <div
        className="relative bg-[#1D1640] rounded-md border-2 border-indigo-600"
        style={{ width: graphWidth + 5, height: graphHeight + 5 }}
      >
        <button
          onClick={() => setShowNetwork(false)}
          className="absolute top-4 right-6"
        >
          <FontAwesomeIcon
            icon="xmark"
            className="text-3xl text-indigo-200 hover:text-white"
          />
        </button>
        <Graph
          graph={graph}
          setGraph={setGraph}
          data={data}
          width={graphWidth}
          height={graphHeight}
          // prevWidth={prevWidth}
          // prevHeight={prevHeight}
          selection={selection}
          eventHandlers={eventHandlers}
        />
      </div>
    </div>
  );
}
