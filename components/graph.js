import G6 from "@antv/g6";
import React, { useEffect, useState } from "react";
import { nodeStateStyles, defaultNode, defaultEdge } from "lib/graph/config";

export default function Graph({
  data,
  width,
  height,
  prevWidth,
  prevHeight,
  onNodeClick,
}) {
  const ref = React.useRef(null);
  const [graph, setGraph] = useState(null);

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
        nodeSpacing: 35,
        linkDistance: 30,
        preventOverlap: true,
      };
      const graphProperties = {
        // fitView: true,
        // fitViewPadding: 10,
        // fitCenter: true,
        animate: false,
        defaultNode: defaultNode,
        nodeStateStyles: nodeStateStyles,
        defaultEdge: defaultEdge,
        // groupByTypes: false,
        modes: {
          default: [
            { type: "drag-canvas" },
            { type: "zoom-canvas", sensitivity: 0.5, minZoom: 0.5, maxZoom: 3 },
            // {
            //   type: "activate-relations",
            //   trigger: "cli",
            //   activeState: "selected",
            //   inactiveState: "",
            // },
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
      newGraph.on("node:mouseenter", (event) => {
        onNodeClick(event);
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

  useEffect(() => {
    if (graph && !graph.destroyed) {
      // otherwise, update the data
      graph.changeData(data);
    }
  }, [data, graph]);
  return <div className="unselectable" ref={ref}></div>;
}
