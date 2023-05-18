import G6 from "@antv/g6";
import React, { useEffect } from "react";
import {
  nodeStateStyles,
  defaultNode,
  defaultEdge,
  defaultCombo,
  comboStateStyles,
} from "lib/graph/config";

export default function Graph({ data, width, height }) {
  const ref = React.useRef(null);

  useEffect(() => {
    const container = ref.current;
    // https://antv-g6.gitee.io/en/docs/api/graphLayout/force#layoutcfgclustering
    const layout = {
      type: "force",
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
      defaultCombo,
      comboStateStyles,
      modes: {
        default: [
          { type: "drag-node" },
          { type: "click-select" },
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

    newGraph.data(data);
    newGraph.render();

    return () => {
      newGraph.destroy();
    };
  }, [data, width, height]);

  return <div ref={ref}></div>;
}
