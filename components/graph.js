import G6 from "@antv/g6";
import React, { useEffect, useRef } from "react";
import { defaultEdge, edgeStateStyles } from "lib/graph/config";

export default function Graph({
  graph,
  setGraph,
  data,
  width,
  height,
  prevWidth,
  prevHeight,
  eventHandlers,
}) {
  const ref = React.useRef(null);

  // get a reference to the current graph for use in cleanup
  const graphRef = useRef();
  graphRef.current = graph;

  useEffect(() => {
    if (
      !graph ||
      graph.destroyed ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      // https://antv-g6.gitee.io/en/docs/api/graphLayout/force#layoutcfgclustering
      var layout = {
        fitCenter: false,
        type: "force",
        // alphaMin: 0.025,
        // don't set nodeSize so the custom ones take precedence
        nodeSpacing: 35,
        preventOverlap: true,
      };
      const container = ref.current;
      const graphProperties = {
        defaultEdge,
        edgeStateStyles,
        modes: {
          default: [
            { type: "drag-canvas" },
            { type: "drag-node" },
            {
              type: "zoom-canvas",
              sensitivity: 0.8,
              minZoom: 0.25,
              maxZoom: 2,
            },
            {
              type: "activate-relations",
              trigger: "click",
              activeState: "active",
              inactiveState: "inactive",
            },
            // this must go after activate-relations so the selected
            // node ends up with the selected state
            { type: "click-select" },
          ],
        },
      };
      const newGraph = new G6.Graph({
        container,
        height,
        width,
        layout,
        ...graphProperties,
      });
      // bind all of the eventHandlers passed in
      for (const [key, value] of Object.entries(eventHandlers)) {
        newGraph.on(key, value);
      }

      // set the data and do the initial render
      newGraph.data(data);
      newGraph.render();
      newGraph.zoomTo(0.75);

      setGraph(newGraph);
    }

    return () => {
      var currentGraph = graphRef.current;
      if (currentGraph) {
        // for some reason, manually removing the graph canvas
        // from the dom is required, but it can cause an error
        // if the dom isn't there anymore, hence the catch
        try {
          currentGraph.destroy();
        } catch (e) {
          console.log("graph.js - Couldn't destroy graph");
        }
      }
      // always try to get rid of the doms
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
    // listing graph here causes problems
  }, [width, height, prevWidth, prevHeight]);

  return <div className="select-none" ref={ref}></div>;
}
