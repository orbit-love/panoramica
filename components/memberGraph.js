import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import helper from "lib/memberGraph/helper";
import Graph from "components/graph";
import Member from "components/cards/network/member";

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
  const [data, setData] = useState(helper.getData({ members, selection }));

  const graphRef = useRef();
  graphRef.current = graph;

  const selectionRef = useRef();
  selectionRef.current = selection;

  const highlightSelection = ({ selection, graph }) => {
    if (graph && !graph.destroyed && selection) {
      const node = graph.findById(selection.id);
      // if already selected, don't reclick
      if (node && !node.hasState("selected")) {
        graph.emit("node:click", { item: node });
      }
    }
  };

  const eventHandlers = {
    "node:click": ({ item }) => setSelection(item.getModel().member),
    "node:dblclick": ({ item }) => {
      graphRef.current.focusItem(item, true);
    },
    "canvas:click": () => setSelection(null),
    afterrender: ({}) => {
      var currentGraph = graphRef.current;
      var currentSelection = selectionRef.current;
      highlightSelection({ graph: currentGraph, selection: currentSelection });
    },
  };

  useEffect(() => {
    setData(helper.getData({ members }));
  }, [members]);

  // whenever the selection changes, click it if not already clicked
  // e.g. when it happens from the orbit levels
  useEffect(() => {
    highlightSelection({ graph, selection });
  }, [graph, selection]);

  // when the network view opens, animate to find the selected node
  useEffect(() => {
    if (showNetwork && selectionRef.current) {
      const node = graphRef.current.findById(selectionRef.current.id);
      graphRef.current.focusItem(node, true);
    }
  }, [showNetwork]);

  const graphWidth = width * 0.85;
  const graphHeight = height * 0.85;

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
          selection={selection}
          eventHandlers={eventHandlers}
        />
        {selection && selection.level && (
          <div className="absolute right-4 bottom-4">
            <Member
              member={selection}
              members={members}
              setSelection={setSelection}
              graph={graph}
            />
          </div>
        )}
      </div>
    </div>
  );
}
