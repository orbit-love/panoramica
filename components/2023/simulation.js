import * as d3 from "d3";
import c from "components/2023/common";
import membersGen from "data/membersGen";

var seed = c.cyrb128("apples");
var rand = c.mulberry32(seed[0]);

export default function Simulation({
  svg,
  orbits,
  selection,
  setSelection,
  number,
}) {
  const strokeColor = c.backgroundColor;
  const bodies = [];

  const fontSize = d3.scaleLinear().range([11, 15]).domain([0, 2]);
  const planetSizes = {
    1: d3.scaleLinear().range([15, 22]).domain([0, 2]),
    2: d3.scaleLinear().range([11, 18]).domain([0, 2]),
    3: d3.scaleLinear().range([9, 15]).domain([0, 2]),
    4: d3.scaleLinear().range([4, 9]).domain([0, 2]),
  };

  const planetColor = d3
    .scaleLinear()
    .domain([0, 1, 2])
    // .range(["#1a237e", "#e1bee7", "#ec407a"]);
    .range(["#312e81", "#c7d2fe", "#fff"]);

  function onClick(e, d) {
    e.stopPropagation();
    setSelection(d);
    svg.selectAll(".show-me").attr("visibility", "hidden");
    d3.select(this.parentNode)
      .selectAll(".show-me")
      .attr("visibility", "visible");
    d3.select(this.parentNode).raise();
  }

  const levels = membersGen({ number });
  levels.forEach((level) => {
    var membersData = level.members;
    for (var i = 0; i < membersData.length; i++) {
      var member = membersData[i];
      var positionScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([0, membersData.length]);
      bodies.push({
        ...member,
        i,
        orbit: orbits[level.number - 1],
        level: level.number,
        position: fuzz(positionScale(i), 0.04),
        planetSize: planetSizes[member.orbit](member.reach),
        planetColor: planetColor(member.love),
        fontSize: fontSize(member.reach),
        initials: c.initials(member.name),
      });
    }
  });
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
    .attr("class", "planet clickable")
    .attr("r", (d) => d.planetSize)
    .attr("fill", (d) => d.planetColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", 3)
    .on("click", onClick);

  // Add the initials of people inside the body
  bodyGroup
    .append("text")
    .attr("class", "clickable")
    .attr("text-anchor", "middle")
    .attr("font-size", (d) => d.planetSize * 0.6)
    .attr("font-weight", 500)
    .attr("visibility", (d) => (d.planetSize > 12 ? "visible" : "hidden"))
    .attr("dy", (d) => d.planetSize / 4)
    .text((d) => d.initials)
    .on("click", onClick);

  // Add the name of the body
  bodyGroup
    .append("text")
    .attr("class", "show-me")
    .attr("fill", c.selectedColor)
    .attr("visibility", (d) =>
      selection && selection.name === d.name ? "visible" : "hidden"
    )
    .attr("text-anchor", "left")
    .attr("font-size", (d) => d.fontSize)
    .attr("font-weight", 400)
    .attr("dx", (d) => d.planetSize + 4)
    .attr("dy", 5)
    .text((d) => d.name.split(" ")[0]);

  function run() {
    counter += 1;
  }

  const counter = 0;
  setInterval(run, 1000);
  run();

  function fuzz(value, factor = 0.15) {
    var r = rand() - 0.5;
    var shift = r * value * factor;
    return value + shift;
  }

  // Animate the bodies
  bodyGroup.each(function (body, i) {
    const self = this;
    const orbit = body.orbit;
    var rx = fuzz(orbit.rx);
    var ry = fuzz(orbit.ry);
    // Create an elliptical path using the SVG path A command
    const pathData = `M ${orbit.cx - rx},${orbit.cy}
        a ${rx} ${ry} 0 1 1 ${rx * 2},0,
        a ${rx} ${ry} 0 1 1 ${rx * -2},0`;

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
