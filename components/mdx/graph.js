import G6 from "@antv/g6";
import React, { useEffect, useState } from "react";
import { nodeStateStyles, defaultNode, defaultEdge } from "lib/graph/config";

export default function Graph({ data, width, height, onNodeClick }) {
  const ref = React.useRef(null);

  useEffect(() => {
    const container = ref.current;
    // https://antv-g6.gitee.io/en/docs/api/graphLayout/force#layoutcfgclustering
    const layout = {
      // type: "force",
      nodeSpacing: 35,
      linkDistance: 30,
      preventOverlap: true,
    };
    const graphProperties = {
      // fitView: true,
      // fitViewPadding: 10,
      // fitCenter: true,
      defaultNode: defaultNode,
      nodeStateStyles: nodeStateStyles,
      defaultEdge: defaultEdge,
      groupByTypes: false,
      modes: {
        default: [
          { type: "drag-canvas" },
          { type: "zoom-canvas", sensitivity: 0.5, minZoom: 0.5, maxZoom: 3 },
          // { type: "click-select" },
          {
            type: "activate-relations",
            trigger: "mouseenter",
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

    newGraph.data(data);
    newGraph.render();

    newGraph.on("node:click", (event) => {
      onNodeClick(event);
    });

    return () => {
      newGraph.destroy();
    };
  }, [data, width, height, onNodeClick]);

  return <div className="unselectable" ref={ref}></div>;
}
