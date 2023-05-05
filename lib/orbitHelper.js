import * as d3 from "d3";
import c from "lib/common";
import { faker } from "@faker-js/faker";
import levelsData from "data/levels";
import membersGen from "data/membersGen";

const helper = {
  sunRadiusFactory: function (ry, o1) {
    return Math.max(ry(o1) - 40, 50);
  },
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
      .range([100000, 500000])
      .domain([1, 100]);

    // Define the orbits
    return levelsData.map(({ name, number, distance, description }, i) => ({
      i,
      cx,
      name,
      number,
      distance,
      description,
      cy: cy + yOffset(distance),
      rx: rx(distance),
      ry: ry(distance),
      revolution: revolution(distance),
    }));
  },
  clearSelection: function (svg) {
    svg.selectAll(".show-me.interest-false").attr("visibility", "hidden");
    svg.selectAll(".show-me").attr("fill", (d) => d.planetColor);
  },
  resetEverything: function ({ svgRef, width, height, setSelection }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    helper.stopAnimation({ svgRef });
    // remove everything in there
    svg.selectAll("*").remove();
    svg.on("click", null);

    // set the attributes
    svg.attr("width", width).attr("height", height);
    // when the svg is clicked, reset the selection
    // todo don't rebind
    svg.on("click", function () {
      helper.clearSelection(svg);
      setSelection(null);
    });
  },

  drawOrbits: function ({ svgRef, width, height, selection, setSelection }) {
    var helper = this;

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
        selection && selection.name === d.name ? c.selectedColor : c.indigo400
      )
      .text((d) => d.name)
      .on("click", (e, d) => {
        e.stopPropagation();
        helper.clearSelection(svg);
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
    const sunRadius = helper.sunRadiusFactory(ry, o1);
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
        helper.clearSelection(svg);
        setSelection({ name: "Mission" });
      });
  },

  drawSun: function ({ svgRef, width, height, selection, setSelection }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    const ry = this.ryFactory(height);
    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);
    const o1 = levelsData[0].distance;
    const sunRadius = helper.sunRadiusFactory(ry, o1);
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
        helper.clearSelection(svg);
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

  translate: function (t, pathNode, pathLength) {
    const point = pathNode.getPointAtLength(t * pathLength);
    return `translate(${point.x}, ${point.y})`;
  },

  getPathNode: function (body, orbit) {
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
  },

  drawMembers: function ({
    svgRef,
    width,
    height,
    number,
    selection,
    setSelection,
  }) {
    var helper = this;

    // reset the seed everytime we create members to avoid differences
    var seed = c.cyrb128("apples");
    var rand = c.mulberry32(seed[0]);
    faker.seed(seed);

    const svg = d3.select(svgRef.current);
    const orbits = this.orbitsFactory(width, height);

    const strokeColor = c.backgroundColor;
    const bodies = [];

    function onClick(e, d) {
      e.stopPropagation();
      setSelection(d);
      helper.clearSelection(svg);
      d3.select(this.parentNode)
        .selectAll(".show-me")
        .attr("visibility", "visible")
        .attr("fill", c.selectedColor);
      d3.select(this.parentNode).raise();
    }

    orbits.forEach((orbit) => {
      const membersData = membersGen({ number, rand, orbit });
      for (var i = 0; i < membersData.length; i++) {
        var member = membersData[i];
        bodies.push(member);
        console.log(member);
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
      .attr("stroke-width", 1)
      .on("click", onClick);

    // Add the initials of people inside the body
    // bodyGroup
    //   .append("text")
    //   .attr("class", "clickable")
    //   .attr("text-anchor", "middle")
    //   .attr("font-size", (d) => d.planetSize * 0.6)
    //   .attr("font-weight", 500)
    //   .attr("fill", (d) => "#fde68a")
    //   .attr("visibility", (d) => (d.ofInterest ? "visible" : "hidden"))
    //   .attr("dy", (d) => d.planetSize / 4)
    //   .text((d) => "�")
    //   .on("click", onClick);

    // Add the name of the body
    bodyGroup
      .append("text")
      .attr("class", (d) => `show-me clickable interest-${d.ofInterest}`)
      .attr(
        "fill",
        (d) =>
          (d.ofInterest && d.planetColor) ||
          (selection && selection.name === d.name && c.selectedColor)
      )
      .attr("visibility", (d) =>
        d.ofInterest || (selection && selection.name === d.name)
          ? "visible"
          : "hidden"
      )
      .attr("text-anchor", "left")
      .attr("font-size", (d) => d.fontSize)
      .attr("font-weight", 400)
      .attr("dx", (d) => d.planetSize + 4)
      .attr("dy", 5)
      .text((d) => d.name.split(" ")[0])
      // .text((d) => "")
      .on("click", onClick);

    // Draw the first position of the bodies
    bodyGroup.each(function (body, i) {
      var self = this;
      const pathNode = helper.getPathNode(body, body.orbit);
      const pathLength = pathNode.getTotalLength();

      d3.select(self)
        .attr("lastTime", body.position)
        .attr("currentTime", 0)
        .attr(
          "transform",
          helper.translate(body.position, pathNode, pathLength)
        );
    });
  },
  // do animations
  transition: function (selection, body, orbit) {
    var helper = this;
    var element = d3.select(selection);

    const pathNode = helper.getPathNode(body, body.orbit);
    const pathLength = pathNode.getTotalLength();

    var duration = orbit.revolution;
    // console.log("starting at X for Y ms", element.attr("lastTime"), duration);

    d3.select(selection)
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attrTween("transform", () => {
        return (t) => {
          var lastTime = parseFloat(element.attr("lastTime"));
          var adjustedT = t + lastTime;
          // save the currentTime for restarting the transition at the same place
          if (adjustedT > 1) {
            adjustedT -= 1;
          }
          element.attr("currentTime", adjustedT);
          return helper.translate(adjustedT, pathNode, pathLength);
        };
      })
      .on("end", () => {
        // console.log("ENDED!");
        // once the cycle ends, reset the lastTime and restart the
        // transition loop from the beginning
        // d3.select(selection)
        //   .attr("lastTime", body.position)
        //   .attr("currentTime", 0);
        helper.transition(selection, body, orbit);
      });
  },
  startAnimation: function ({ svgRef }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    const bodyGroup = svg.selectAll("g.body-group");

    // set up the transition
    bodyGroup.each(function (body, i) {
      var self = this;
      const orbit = body.orbit;
      if (!d3.active(self)) {
        helper.transition(self, body, orbit);
      }
    });
  },
  stopAnimation: function ({ svgRef }) {
    const svg = d3.select(svgRef.current);
    const bodyGroup = svg.selectAll("g.body-group");

    // alter the transition so it stops moving
    bodyGroup.each(function (_body, _i) {
      var self = this;
      var element = d3.select(self);
      // only do anything if there is an active transition
      // otherwise it will start another transition
      if (d3.active(self)) {
        // stop the transition
        element.transition();
        // only override lastTime if currentTime exists,
        // i.e. if the animation has already been run
        // this is only needed beceause stopAnimation gets called on startup
        if (parseFloat(element.attr("currentTime")) !== 0) {
          setTimeout(function () {
            element.attr("lastTime", element.attr("currentTime"));
            // console.log("viz stopped at", element.attr("lastTime"));
          }, 100);
        }
      }
    });
  },
};

export default helper;
