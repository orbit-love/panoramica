import * as d3 from "d3";
import c from "components/2023/common";
import bodiesData from "data/bodies";

export default function Simulation({ svg, orbits }) {
  const strokeColor = c.backgroundColor;
  const bodies = [];
  const lowOpacity = 0.0;

  // reverse the array so the closest bodies are drawn last and stay on top
  for (var i = 0; i < bodiesData.length; i++) {
    var bodyData = bodiesData[i];
    bodies.push({ ...bodyData, orbit: orbits[bodyData.orbit - 1], i });
  }

  // Create a group for each body
  const bodyGroup = svg
    .selectAll("g.body-group")
    .data(bodies)
    .enter()
    .append("g")
    .attr("class", "body-group")
    .attr("opacity", lowOpacity);

  // add a dark rectangle behind the text and the circle
  // bodyGroup
  //   .append("rect")
  //   .attr("fill", strokeColor)
  //   .attr("width", 130) // this isn't right for all text
  //   .attr("height", (d) => d.orbit.fontSize * 2)
  //   .attr("opacity", 0)
  //   // don't let lines peek through between the body and the text
  //   .attr("x", (d) => d.orbit.planetSize - 10)
  //   .attr("y", (d) => -d.orbit.fontSize);

  // Draw a circle for each body
  bodyGroup
    .append("circle")
    .attr("r", (d) => d.orbit.planetSize)
    .attr("fill", (d) => d.orbit.planetColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", 3);

  // Add the amount of people inside the body
  bodyGroup
    .append("text")
    .attr("fill", "white")
    .attr("text-anchor", "middle")
    .attr("font-size", (d) => d.orbit.fontSize * 0.9)
    .attr("font-weight", 500)
    .attr("dx", (d) => 0)
    .attr("dy", (d) => 5)
    .text((d) => d.amount);

  // Add the name of the body
  bodyGroup
    .append("text")
    .attr("fill", (d) => d.orbit.planetColor)
    .attr("text-anchor", "left")
    .attr("font-size", (d) => d.orbit.fontSize)
    .attr("font-weight", 500)
    .attr("dx", (d) => d.orbit.planetSize + 4)
    .attr("dy", 5)
    .text((d) => d.name);

  const counter = 0;
  setInterval(() => {
    bodyGroup.attr("opacity", (d, i) => {
      const [t0, t1] = d.t;
      if (counter >= t0 && (counter < t1 || !t1)) {
        return 1;
      } else {
        return lowOpacity;
      }
    });
    counter += 1;
  }, 1000);

  // Animate the bodies
  bodyGroup.each(function (body, i) {
    const self = this;
    const orbit = body.orbit;
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

    function translate(t) {
      const point = pathNode.getPointAtLength(t * pathLength);
      return `translate(${point.x}, ${point.y})`;
    }

    function transition(selection) {
      d3.select(selection)
        // .attr("opacity", 1)
        .transition()
        .duration(orbit.revolution)
        .ease(d3.easeLinear)
        .attrTween("transform", () => {
          return (t) => {
            let it = initialT(body);
            let total = t + it;
            if (total > 1) {
              total = total - 1;
            }
            return translate(total);
          };
        })
        .on("end", () => transition(selection));
    }
    function initialT(body) {
      return body.position || 0;
    }
    d3.select(self).attr("transform", translate(initialT(body)));
    transition(self);
  });
}
