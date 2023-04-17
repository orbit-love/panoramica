import * as d3 from "d3";
import c from "components/2023/common";
import membersData from "data/members";

export default function Simulation({ svg, orbits, selection, setSelection }) {
  const strokeColor = c.backgroundColor;
  const bodies = [];

  const fontSize = d3.scaleLinear().range([16, 12]).domain([1, 4]);
  const planetSize = d3.scaleLinear().range([24, 13]).domain([1, 4]);
  const planetColor = d3
    .scaleLinear()
    .domain([1, 4])
    .range(["#F503EA", "#B15AF8"]);

  // reverse the array so the closest bodies are drawn last and stay on top
  for (var i = 0; i < membersData.length; i++) {
    var bodyData = membersData[i];
    var positionScale = d3
      .scaleLinear()
      .range([0, 1])
      .domain([0, membersData.length]);
    bodies.push({
      ...bodyData,
      orbit: orbits[bodyData.orbit - 1],
      level: bodyData.orbit,
      i,
      position: positionScale(i),
      planetSize: planetSize(bodyData.orbit),
      planetColor: planetColor(bodyData.orbit),
      fontSize: fontSize(bodyData.orbit),
      initials: c.initials(bodyData.name),
    });
  }

  function onClick(e, d) {
    e.stopPropagation();
    setSelection(d);
    svg.selectAll(".show-me").attr("opacity", 0);
    d3.select(this.parentNode).selectAll(".show-me").attr("opacity", 1);
  }

  // Create a group for each body
  const bodyGroup = svg
    .selectAll("g.body-group")
    .data(bodies)
    .enter()
    .append("g")
    .attr("class", "body-group");

  // Draw a circle for each body
  bodyGroup
    .append("circle")
    .attr("class", "clickable")
    .attr("r", (d) => d.planetSize)
    .attr("fill", (d) => d.planetColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", 3)
    .on("click", onClick);

  // Add the initials of people inside the body
  bodyGroup
    .append("text")
    .attr("class", "clickable")
    .attr("fill", c.whiteColor)
    .attr("text-anchor", "middle")
    .attr("font-size", (d) => d.planetSize * 0.7)
    .attr("font-weight", 500)
    .attr("dy", (d) => d.planetSize / 4)
    .text((d) => d.initials)
    .on("click", onClick);

  // Add the name of the body
  bodyGroup
    .append("text")
    .attr("class", "show-me")
    .attr("fill", c.selectedColor)
    .attr("opacity", (d) => (selection && selection.name === d.name ? 1 : 0))
    .attr("text-anchor", "left")
    .attr("font-size", (d) => d.fontSize)
    .attr("font-weight", 300)
    .attr("dx", (d) => d.planetSize + 4)
    .attr("dy", 5)
    .text((d) => d.name);

  function run() {
    // bodyGroup.attr("opacity", (d, i) => {
    //   if (typeof d.t !== "object") {
    //     return;
    //   }
    //   const [t0, t1] = d.t;
    //   if (counter >= t0 && (counter < t1 || !t1)) {
    //     return 1;
    //   } else {
    //     return lowOpacity;
    //   }
    // });
    counter += 1;
  }

  const counter = 0;
  setInterval(run, 1000);
  run();

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
