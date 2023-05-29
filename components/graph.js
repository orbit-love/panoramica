import G6 from "@antv/g6";
import React, { useEffect, useRef } from "react";
import { defaultEdge, edgeStateStyles } from "lib/graph/config";
import c from "lib/common";

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

  const { layout, modes, defaultZoom } = c.graph;

  useEffect(() => {
    if (
      !graph ||
      graph.destroyed ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      const container = ref.current;
      const newGraph = new G6.Graph({
        container,
        height,
        width,
        layout,
        modes,
        defaultEdge,
        edgeStateStyles,
      });
      // bind all of the eventHandlers passed in
      for (const [key, value] of Object.entries(eventHandlers)) {
        newGraph.on(key, value);
      }

      // set the data and do the initial render
      newGraph.data(data);
      newGraph.render();
      newGraph.zoomTo(defaultZoom);

      setGraph(newGraph);
    }

    return () => {
      var currentGraph = graphRef.current;
      if (currentGraph && !currentGraph.destroyed) {
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
    // listing graph and data here causes problems
  }, [width, height, prevWidth, prevHeight]);

  useEffect(() => {
    var currentGraph = graphRef.current;
    if (currentGraph && !currentGraph.destroyed) {
      currentGraph.changeData(data);
    }
  }, [data]);

  return <div className="select-none" ref={ref}></div>;
}
