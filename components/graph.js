import G6 from "@antv/g6";
import React, { useEffect, useState } from "react";
import {
  nodeStateStyles,
  defaultNode,
  defaultEdge,
  edgeStateStyles,
} from "lib/graph/config";

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

  useEffect(() => {
    if (
      !graph ||
      graph.destroyed ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      const container = ref.current;
      // https://antv-g6.gitee.io/en/docs/api/graphLayout/force#layoutcfgclustering
      const layout = {
        type: "concentric",
        // nodeSpacing: 15,
        // linkDistance: 10,
        preventOverlap: true,
      };
      const graphProperties = {
        defaultNode,
        nodeStateStyles,
        defaultEdge,
        edgeStateStyles,
        modes: {
          default: [
            { type: "drag-canvas" },
            { type: "zoom-canvas", sensitivity: 0.5, minZoom: 0.5, maxZoom: 3 },
            {
              type: "activate-relations",
              trigger: "click",
              activeState: "selected",
              inactiveState: "",
            },
          ],
        },
      };
      const newGraph = new G6.Graph({
        container,
        height,
        width,
        layout: layout,
        ...graphProperties,
      });
      // bind all of the eventHandlers passed in
      for (const [key, value] of Object.entries(eventHandlers)) {
        newGraph.on(key, value);
      }
      newGraph.data(data);
      newGraph.render();
      setGraph(newGraph);
    }

    return () => {
      if (graph) {
        // for some reason, manually removing the graph canvas
        // from the dom is required, but it can cause an error
        // if the dom isn't there anymore, hence the catch
        try {
          while (container.firstChild) {
            container.removeChild(container.firstChild);
          }
          graph.destroy();
        } catch (e) {}
      }
    };
    // listing graph here causes problems
  }, [width, height, prevWidth, prevHeight]);

  // if you want the graph to update, do it manually
  // useEffect(() => {
  //   if (graph && !graph.destroyed) {
  //     // otherwise, update the data
  //     graph.changeData(data);
  //   }
  // }, [data, graph]);
  return <div className="unselectable" ref={ref}></div>;
}
