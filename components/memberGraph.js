import React, { useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import c from "lib/common";

import helper from "lib/graph/helper";
import Graph from "components/graph";
import Member from "components/cards/network/member";
import ActivitiesSlider from "components/activitiesSlider";

export default function MemberGraph({
  width,
  height,
  community,
  selection,
  setSelection,
  graph,
  setGraph,
  showNetwork,
  setShowNetwork,
  data,
  setData,
  levels,
  low,
  setLow,
  high,
  setHigh,
}) {
  const graphRef = useRef();
  graphRef.current = graph;

  const selectionRef = useRef();
  selectionRef.current = selection;

  // clicks on a node to make sure it has the selection in the network view
  // if the node is already selected, it does not click
  const highlightSelection = ({ selection, graph }) => {
    if (graph && !graph.destroyed && selection) {
      const node = graph.findById(selection.id);
      // if already selected, don't reclick
      if (node && !node.hasState("selected")) {
        graph.emit("node:click", { item: node });
      }
    }
  };

  const resetItem = ({ graph, item }) => {
    graph.setItemState(item, "active", false);
    graph.setItemState(item, "selected", false);
    graph.setItemState(item, "inactive", true);
  };

  const eventHandlers = {
    "node:click": ({ item }) => setSelection(item?.getModel().member),
    "node:dblclick": ({ item }) => {
      graphRef.current.focusItem(item, true);
    },
    "canvas:click": () => {
      // activate relations doesn't set all the states correctly on
      // canvas click, so we reset all states manually
      var currentGraph = graphRef.current;
      currentGraph
        .getNodes()
        .forEach((item) => resetItem({ graph: currentGraph, item }));
      currentGraph
        .getEdges()
        .forEach((item) => resetItem({ graph: currentGraph, item }));
      setSelection(null);
    },
    afteritemstatechange: ({ item, state, enabled }) => {
      if (item.getType() === "node") {
        var currentGraph = graphRef.current;
        const model = item.getModel();
        if ((state === "active" || state === "selected") && enabled) {
          currentGraph.updateItem(item, {
            ...item,
            label: model.slicedName,
          });
        } else if (state === "inactive" && enabled) {
          if (model.member?.level === 4) {
            currentGraph.updateItem(item, {
              ...item,
              label: "",
            });
          }
        }
      }
    },
    afterrender: ({}) => {
      var currentGraph = graphRef.current;
      var currentSelection = selectionRef.current;
      highlightSelection({ graph: currentGraph, selection: currentSelection });
    },
  };

  // whenever the selection changes, click it if not already clicked
  // e.g. when it happens from the orbit levels
  useEffect(() => {
    highlightSelection({ graph, selection });
  }, [graph, selection]);

  // set the data when the members change
  useEffect(() => {
    setData(helper.getData({ community, levels }));
  }, [community, setData, levels]);

  // when the network view opens, animate to find the selected node
  // if no node is selected, choose the first member and click/focus on them
  useEffect(() => {
    if (showNetwork && graphRef.current && !graphRef.current.destroyed) {
      var node;
      if (selectionRef.current) {
        node = graphRef.current.findById(selectionRef.current.id);
      } else {
        node = graphRef.current.findById(community.members[0].id);
        graphRef.current.emit("node:click", { item: node });
      }
      graphRef.current.focusItem(node, true);
    }
  }, [showNetwork, community]);

  const graphWidth = width * 0.95;
  const graphHeight = height * 0.95;

  // the graphWidth + 5 prevents the canvas from overflowing the modal
  return (
    <div
      className={`absolute top-0 left-0 z-50 w-full h-full flex items-center justify-center bg-[${
        c.backgroundColor
      }] bg-opacity-0 pointer-events-none ${!showNetwork && "hidden"}`}
    >
      <div
        className="relative bg-[#150d33] rounded-md border-2 border-indigo-600 pointer-events-auto"
        style={{ width: graphWidth + 5, height: graphHeight + 5 }}
      >
        {community.activities?.length > 0 && (
          <div className="absolute top-0 left-2 px-4 w-64">
            <ActivitiesSlider
              community={community}
              low={low}
              setLow={setLow}
              high={high}
              setHigh={setHigh}
            />
          </div>
        )}
        <button
          onClick={() => setShowNetwork(false)}
          className="absolute top-4 right-6"
        >
          <FontAwesomeIcon
            icon="xmark"
            className="text-3xl text-indigo-200 hover:text-white"
          />
        </button>
        {data && (
          <Graph
            graph={graph}
            setGraph={setGraph}
            data={data}
            width={graphWidth}
            height={graphHeight}
            selection={selection}
            eventHandlers={eventHandlers}
          />
        )}
        {selection && selection.level && (
          <div className="absolute right-4 bottom-4">
            <Member
              member={selection}
              community={community}
              setSelection={setSelection}
            />
          </div>
        )}
      </div>
    </div>
  );
}
