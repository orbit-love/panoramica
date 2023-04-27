import * as d3 from "d3";
import c from "components/2023/common";
import membersGen from "data/membersGen";

var seed = c.cyrb128("apples");
var rand = c.mulberry32(seed[0]);

function fuzz(value, factor = 0.15) {
  var r = rand() - 0.5;
  var shift = r * value * factor;
  return value + shift;
}

function initialT(body) {
  return body.position || 0;
}

function translate(t, pathNode, pathLength) {
  const point = pathNode.getPointAtLength(t * pathLength);
  return `translate(${point.x}, ${point.y})`;
}

export default function Simulation({
  svg,
  orbits,
  selection,
  setSelection,
  number,
  animate,
}) {
  const strokeColor = c.backgroundColor;
  const bodies = [];

  const fontSize = d3.scaleLinear().range([11, 15]).domain([0, 2]);
  const planetSizes = {
    1: d3.scaleLinear().range([13, 25]).domain([0, 2]),
    2: d3.scaleLinear().range([10, 20]).domain([0, 2]),
    3: d3.scaleLinear().range([8, 16]).domain([0, 2]),
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

  // add attributes to the bodies needed for rendering
  const levels = membersGen({ number });
  levels.forEach((level) => {
    var orbit = orbits[level.number - 1];
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
        orbit,
        rx: fuzz(orbit.rx),
        ry: fuzz(orbit.ry),
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

  var getPathNode = function (body, orbit) {
    var rx = body.rx;
    var ry = body.ry;
    // Create an elliptical path using the SVG path A command
    const pathData = `M ${orbit.cx - rx},${orbit.cy}
        a ${rx} ${ry} 0 1 1 ${rx * 2},0,
        a ${rx} ${ry} 0 1 1 ${rx * -2},0`;

    const pathNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathNode.setAttribute("d", pathData);
    return pathNode;
  };

  // Draw the first position of the bodies
  bodyGroup.each(function (body, i) {
    var self = this;
    const pathNode = getPathNode(body, body.orbit);
    const pathLength = pathNode.getTotalLength();

    d3.select(self).attr(
      "transform",
      translate(initialT(body), pathNode, pathLength)
    );
  });

  // do animations
  function transition(selection, body, orbit) {
    const pathNode = getPathNode(body, body.orbit);
    const pathLength = pathNode.getTotalLength();
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
          return translate(total, pathNode, pathLength);
        };
      })
      .on("end", () => transition(selection, body, orbit));
  }

  // animate the bodies
  bodyGroup.each(function (body, i) {
    var self = this;
    const orbit = body.orbit;
    if (animate) {
      transition(self, body, orbit);
    }
  });
}
