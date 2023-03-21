import * as d3 from "d3";
import c from "components/2023/common";
import React, { useEffect, useRef } from "react";

export default function Orbits() {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    // remove everything in there
    svg.selectAll("*").remove();

    const width = window.innerWidth,
      height = window.innerHeight * 0.65;

    // set the attributes
    svg.attr("width", width).attr("height", height);

    // create a scale for the orbit x radius
    const rx = d3
      .scalePow()
      .exponent(0.5)
      .range([0, width / 2 - 50])
      .domain([5, 100]);

    // create a scale for the orbit y radius
    const ry = d3
      .scalePow()
      .exponent(1)
      .range([0, height / 3.5])
      .domain([0, 100]);

    // tighten up the orbits at the top
    const yOffset = d3
      .scalePow()
      .exponent(1.0)
      .range([0, 100])
      .domain([1, 100]);

    const ringOpacity = 0.4;
    const revolution = d3.scaleLinear().range([10000, 40000]).domain([1, 100]);
    const planetSize = d3.scaleLinear().range([25, 18]).domain([1, 100]);
    const fontSize = d3.scaleLinear().range([17, 12]).domain([1, 100]);
    const planetColor = d3
      .scaleLinear()
      .domain([0, 100])
      .range(["#F503EA", "#8F85FF"]);

    // create orbit level rings on a 1-100 scale
    const levels = [
      {
        size: 30,
        name: "Advocates",
        planets: [
          { name: "Product Champions", amount: "50" },
          { name: "Customer Council", amount: "35" },
          { name: "Meetup Organizers", amount: "12" },
        ],
      },
      {
        size: 53,
        name: "Contributors",
        planets: [
          { name: "Dev Conference", amount: "250" },
          { name: "Beta Users", amount: "200" },
          { name: "Code Contributors", amount: "80" },
          { name: "Translators", amount: "25" },
        ],
      },
      {
        size: 77,
        name: "Users",
        planets: [
          { name: "Product Users", amount: "11k" },
          { name: "Discord Community", amount: "3k" },
          { name: "API Users", amount: "600" },
        ],
      },
      {
        size: 97,
        name: "Explorers",
        planets: [
          { name: "Twitter Followers", amount: "40k" },
          { name: "Blog Readers", amount: "30k" },
          { name: "Newsletter Subscribers", amount: "25k" },
        ],
      },
    ];

    // orbit level 1
    const o1 = levels[0].size;

    // the center where each orbit ellipse is placed
    const cx = width / 2;
    const cy = height / 2 - 90;

    // Define the orbits
    const orbits = levels.map(({ name, size, planets }, i) => ({
      i,
      cx,
      name,
      planets,
      cy: cy + yOffset(size),
      rx: rx(size),
      ry: ry(size),
      revolution: revolution(size),
      planetSize: planetSize(size),
      planetColor: planetColor(size),
      fontSize: fontSize(size),
    }));

    // set the size of the sun
    const sunRadius = rx(o1) / 3.5;
    const sunColor = "#FCFDFE";
    const strokeColor = c.backgroundColor;
    const sunCy = cy - 5 - 15;

    // put orbit level labels
    svg
      .selectAll("text.orbit-label")
      .data(orbits)
      .join("text")
      .attr("class", "orbit-label")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.cx)
      .attr("y", (d) => d.cy + d.ry + 25)
      .attr("font-size", 16)
      .attr("font-weight", 500)
      .attr("opacity", ringOpacity)
      .attr("fill", (d) => d.planetColor)
      .text((d) => d.name);

    // draw the orbits
    svg
      .selectAll("ellipse")
      .data(orbits)
      .join("ellipse")
      .attr("stroke", (d) => d.planetColor)
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-opacity", ringOpacity)
      .attr("stroke-width", 3);

    const planets = [];
    // reverse the array so the closest planets are drawn last and stay on top
    orbits.reverse().forEach((orbit) => {
      for (var i = 0; i < orbit.planets.length; i++) {
        planets.push({ ...orbit.planets[i], orbit, i });
      }
    });

    // Create a group for each planet
    const planetGroup = svg
      .selectAll("g.planet-group")
      .data(planets)
      .enter()
      .append("g")
      .attr("class", "planet-group")
      .attr("opacity", 0);

    // add a dark rectangle behind the text and the circle
    planetGroup
      .append("rect")
      .attr("fill", strokeColor)
      .attr("width", 130) // this isn't right for all text
      .attr("height", (d) => d.orbit.fontSize * 2)
      .attr("opacity", 0)
      // don't let lines peek through between the planet and the text
      .attr("x", (d) => d.orbit.planetSize - 10)
      .attr("y", (d) => -d.orbit.fontSize);

    // Draw a circle for each planet
    planetGroup
      .append("circle")
      .attr("r", (d) => d.orbit.planetSize)
      .attr("fill", (d) => d.orbit.planetColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 3);

    // Add the amount of people inside the planet
    planetGroup
      .append("text")
      .attr("fill", "white")
      .attr("text-anchor", "middle")
      .attr("font-size", (d) => d.orbit.fontSize * 0.9)
      .attr("font-weight", 500)
      .attr("dx", (d) => 0)
      .attr("dy", (d) => 5)
      .text((d) => d.amount);

    // Add the example text next to the planet
    planetGroup
      .append("text")
      .attr("fill", (d) => d.orbit.planetColor)
      .attr("text-anchor", "left")
      .attr("font-size", (d) => d.orbit.fontSize)
      .attr("font-weight", 500)
      .attr("dx", (d) => d.orbit.planetSize + 4)
      .attr("dy", 5)
      .text((d) => d.name);

    // Animate the planets
    planetGroup.each(function (planet, i) {
      const self = this;
      const orbit = planet.orbit;
      // Create an elliptical path using the SVG path A command
      const pathData = `M ${orbit.cx - orbit.rx},${orbit.cy}
        a ${orbit.rx} ${orbit.ry} 0 1 1 ${orbit.rx * 2},0,
        a ${orbit.rx} ${orbit.ry} 0 1 1 ${orbit.rx * -2},0`;

      const pathNode = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      pathNode.setAttribute("d", pathData);
      const pathLength = pathNode.getTotalLength();

      const startDelay = 0;
      const baseDelay = 2500;
      // spread the planets evenly amongst each ring
      const newPlanetAfter =
        1000 * orbit.i +
        1 +
        planet.i * (orbit.revolution / orbit.planets.length);
      const hideTextAfter = startDelay + (planet.i + 1) * baseDelay;

      function hideText(selection) {
        // d3.select(selection).selectAll("text").attr("opacity", 0);
        // d3.select(selection).selectAll("rect").attr("opacity", 0);
      }

      function transition(selection) {
        d3.select(selection)
          .attr("opacity", 1)
          .transition()
          .duration(orbit.revolution)
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            return function (t) {
              const point = pathNode.getPointAtLength(t * pathLength);
              return `translate(${point.x}, ${point.y})`;
            };
          })
          .on("end", () => transition(selection));
      }
      setTimeout(() => {
        transition(self);
      }, newPlanetAfter);
      setTimeout(() => {
        hideText(self);
      }, hideTextAfter);
    });

    // add a clip path
    svg
      .append("clipPath")
      .attr("id", "clip-path-1")
      .append("rect")
      .attr("x", cx - sunRadius)
      .attr("y", sunCy - sunRadius - 5) // for the stroke on the circle
      .attr("width", sunRadius * 2)
      .attr("height", sunRadius);

    // draw the sun
    svg
      .append("circle")
      .attr("fill", sunColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy);

    // draw a clipped yellow circle to cover the back of the ring
    svg
      .append("circle")
      .attr("fill", sunColor)
      .attr("stroke", strokeColor)
      .attr("stroke-width", 5)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .attr("clip-path", "url(#clip-path-1)");

    // draw the text on the circle
    svg
      .append("text")
      .attr("x", cx)
      .attr("y", sunCy + 3) // push it down so it is in the middle of the circle
      .attr("fill", strokeColor)
      .attr("text-anchor", "middle")
      .attr("font-weight", 700)
      .text("Mission");
  });

  return (
    <svg ref={svgRef} style={{ width: "100%", height: "100%" }}>
      <g></g>
    </svg>
  );
}
