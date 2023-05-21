import G6 from "@antv/g6";
import React, { useEffect } from "react";
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
  selection,
}) {
  const ref = React.useRef(null);

  useEffect(() => {
    if (
      !graph ||
      graph.destroyed ||
      width !== prevWidth ||
      height !== prevHeight
    ) {
      // https://antv-g6.gitee.io/en/docs/api/graphLayout/force#layoutcfgclustering
      var layout;
      if (selection && false) {
        // leave this out for the moment, it could be good for an interstitial widget
        // for 1-3 degrees of neighbors
        layout = {
          type: "radial",
          focusNode: selection.id,
          nodeSize: 200,
          linkDistance: 50,
          nodeSpacing: 50,
          preventOverlap: true,
          strictRadial: true,
          unitRadius: 150,
        };
      } else {
        layout = {
          fitCenter: false,
          alphaMin: 0.05,
          type: "force",
          nodeSize: 50,
          nodeSpacing: 50,
          linkDistance: 15,
          preventOverlap: true,
        };
      }
      const container = ref.current;
      const graphProperties = {
        defaultNode,
        nodeStateStyles,
        defaultEdge,
        edgeStateStyles,
        modes: {
          default: [
            { type: "drag-canvas" },
            {
              type: "zoom-canvas",
              sensitivity: 0.8,
              minZoom: 0.25,
              maxZoom: 2,
            },
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

      // after the render, click a node if there's a selection and focus on it
      newGraph.once("afterrender", () => {
        if (selection) {
          const node = newGraph.findById(selection.id);
          newGraph.emit("node:click", { item: node });
          newGraph.focusItem(node, true);
        }
      });

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

  return <div className="unselectable" ref={ref}></div>;
}
