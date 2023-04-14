import * as d3 from "d3";
import c from "components/2023/common";
import membersData from "data/members";

export default function Simulation({ svg, orbits, selection, setSelection }) {
  const strokeColor = c.backgroundColor;
  const bodies = [];
  const lowOpacity = 0.8;

  const fontSize = d3.scaleLinear().range([15, 10]).domain([1, 4]);
  const planetSize = d3.scaleLinear().range([24, 13]).domain([1, 4]);
  const planetColor = d3
    .scaleLinear()
    .domain([1, 4])
    .range(["#F503EA", "#B15AF8"]);

  // reverse the array so the closest bodies are drawn last and stay on top
  for (var i = 0; i < membersData.length; i++) {
    var bodyData = membersData[i];
    var scale = d3.scaleLinear().range([0, 1]).domain([0, membersData.length]);
    var position = scale(i);
    bodies.push({
      ...bodyData,
      orbit: orbits[bodyData.orbit - 1],
      i,
      position,
      planetSize: planetSize(bodyData.orbit),
      planetColor: planetColor(bodyData.orbit),
      fontSize: fontSize(bodyData.orbit),
      initials: c.initials(bodyData.name),
    });
  }

  // Create a group for each body
  const bodyGroup = svg
    .selectAll("g.body-group")
    .data(bodies)
    .enter()
    .append("g")
    .attr("class", "body-group clickable")
    .attr("opacity", lowOpacity)
    .on("mouseover", function () {
      d3.select(this).attr("opacity", 1);
    })
    .on("mouseout", function () {
      d3.select(this).attr("opacity", lowOpacity);
    })
    .on("click", (e, d) => {
      e.stopPropagation();
      setSelection(d);
    });

  // add a dark rectangle behind the text and the circle
  bodyGroup
    .append("rect")
    .attr("class", "clickable")
    .attr("width", (d) => d.planetSize * 6) // this isn't right for all text
    .attr("height", (d) => d.fontSize * 3)
    .attr("opacity", 0) // invisible as its a click target
    // don't let lines peek through between the body and the text
    .attr("x", (d) => -d.planetSize)
    .attr("y", (d) => -d.planetSize);

  // Draw a circle for each body
  bodyGroup
    .append("circle")
    .attr("r", (d) => d.planetSize)
    .attr("fill", (d) => d.planetColor)
    .attr("stroke", strokeColor)
    .attr("stroke-width", 3);

  // Add the initials of people inside the body
  bodyGroup
    .append("text")
    .attr("fill", c.whiteColor)
    .attr("text-anchor", "middle")
    .attr("font-size", (d) => d.planetSize * 0.7)
    .attr("font-weight", 500)
    .attr("dy", (d) => d.planetSize / 4)
    .text((d) => d.initials);

  // Add the name of the body
  bodyGroup
    .append("text")
    .attr("fill", c.whiteColor)
    .attr("text-anchor", "left")
    .attr("font-size", (d) => d.fontSize)
    .attr("font-weight", 400)
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
