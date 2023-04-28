import React from "react";
import * as d3 from "d3";
import c from "components/2023/common";
import levelsData from "data/levels";
import Simulation from "components/2023/simulation";

const helper = {
  rxFactory: function (width) {
    return d3
      .scalePow()
      .exponent(0.7)
      .range([0, width / 2 - 100])
      .domain([5, 100]);
  },

  // create a scale for the orbit y radius
  ryFactory: function (height) {
    return d3
      .scalePow()
      .exponent(1)
      .range([0, height / 2.5])
      .domain([0, 100]);
  },
  cxFactory: function (width) {
    return width / 2;
  },
  cyFactory: function (height) {
    return height / 2 - 90;
  },

  orbitsFactory: function (width, height) {
    // create a scale for the orbit x radius
    const rx = this.rxFactory(width);
    // create a scale for the orbit y radius
    const ry = this.ryFactory(height);
    // the center where each orbit ellipse is placed
    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);

    // tighten up the orbits at the top
    const yOffset = d3
      .scalePow()
      .exponent(1.0)
      .range([0, 100])
      .domain([1, 100]);
    // how fast bodies move in orbit
    const revolution = d3
      .scalePow()
      .exponent(2)
      .range([100000, 600000])
      .domain([1, 100]);

    // Define the orbits
    return levelsData.map(({ name, distance, description }, i) => ({
      i,
      cx,
      name,
      distance,
      description,
      cy: cy + yOffset(distance),
      rx: rx(distance),
      ry: ry(distance),
      revolution: revolution(distance),
    }));
  },
  clearSelection: function (svg) {
    svg.selectAll(".show-me").attr("visibility", "hidden");
  },
  resetEverything: function ({ svgRef, width, height, setSelection }) {
    var self = this;
    const svg = d3.select(svgRef.current);
    // remove everything in there
    svg.selectAll("*").remove();
    // set the attributes
    svg.attr("width", width).attr("height", height);
    // when the svg is clicked, reset the selection
    // todo don't rebind
    svg.on("click", function () {
      self.clearSelection(svg);
      setSelection(null);
    });
  },

  drawOrbits: function ({ svgRef, width, height, selection, setSelection }) {
    var self = this;

    const svg = d3.select(svgRef.current);
    const ry = this.ryFactory(height);

    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);

    // constants that don't depend on width and height
    const ringOpacity = 0.6;

    // get the orbits
    const orbits = this.orbitsFactory(width, height);

    // put orbit level labels
    svg
      .selectAll("text.orbit-label")
      .data(orbits)
      .join("text")
      .attr("class", "orbit-label clickable")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.cx)
      .attr("y", (d) => d.cy + d.ry + 24)
      .attr("font-size", 16)
      .attr("font-weight", 400)
      .attr("fill", (d) =>
        selection && selection.name === d.name
          ? c.selectedColor
          : c.neutralColor
      )
      .text((d) => d.name)
      .on("click", (e, d) => {
        e.stopPropagation();
        self.clearSelection(svg);
        setSelection(d);
      });

    // draw the orbits
    svg
      .selectAll("ellipse")
      .data(orbits)
      .join("ellipse")
      .attr("stroke", (d) =>
        selection && selection.name === d.name
          ? c.selectedColor
          : c.neutralColor
      )
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-opacity", ringOpacity - 0.3)
      .attr("stroke-width", 2);

    // orbit level 1
    const o1 = levelsData[0].distance;

    // set the size of the sun
    const sunRadius = ry(o1) - 30;
    const sunColor = c.whiteColor;
    const strokeColor = c.backgroundColor;
    const sunCy = cy + 10;

    // add a clip path
    svg
      .selectAll("#clip-path-1")
      .data([1])
      .join("clipPath")
      .attr("id", "clip-path-1")
      .append("rect")
      .attr("x", cx - sunRadius)
      .attr("y", sunCy - sunRadius - 5) // for the stroke on the circle
      .attr("width", sunRadius * 2)
      .attr("height", sunRadius);

    // draw the sun
    svg
      .selectAll("circle.sun")
      .data([1])
      .join("circle")
      .attr("class", "sun clickable")
      .attr("stroke", strokeColor)
      .attr("fill", (_) =>
        selection && selection.name === "Mission" ? c.selectedColor : sunColor
      )
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .on("click", (e) => {
        e.stopPropagation();
        self.clearSelection(svg);
        setSelection({ name: "Mission" });
      });
  },

  drawSun: function ({ svgRef, width, height, selection, setSelection }) {
    const svg = d3.select(svgRef.current);
    const ry = this.ryFactory(height);
    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);
    const o1 = levelsData[0].distance;
    const sunRadius = ry(o1) - 30;
    const sunColor = c.whiteColor;
    const strokeColor = c.backgroundColor;
    const sunCy = cy + 10;
    // draw a clipped circle to cover the back of the ring
    svg
      .selectAll("circle.sun-clip")
      .data([1])
      .join("circle")
      .attr("class", "sun-clip clickable")
      .attr("fill", (_) =>
        selection && selection.name === "Mission" ? c.selectedColor : sunColor
      )
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .attr("clip-path", "url(#clip-path-1)")
      .on("click", (e) => {
        e.stopPropagation();
        clearSelection(svg);
        setSelection({ name: "Mission" });
      });

    // draw the text on the circle
    const text = svg
      .selectAll("text.circle-text")
      .data([1])
      .join("text")
      .attr("class", "circle-text pointer-events-none")
      .attr("x", cx)
      .attr("y", sunCy - 5) // push it down so it is in the middle of the circle
      .attr("fill", strokeColor)
      .attr("text-anchor", "middle")
      .attr("font-weight", 600);

    text
      .selectAll("tspan")
      .data([1])
      .join("tspan")
      .text("Mission")
      .attr("dy", 10);
  },
  runSimulation: function ({
    svgRef,
    width,
    height,
    selection,
    setSelection,
    number,
    animate,
  }) {
    const svg = d3.select(svgRef.current);
    const orbits = this.orbitsFactory(width, height);
    // Add the bodies
    Simulation({ svg, orbits, selection, setSelection, number, animate });
  },
};

export default helper;
