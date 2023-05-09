import * as d3 from "d3";
import c from "lib/common";
import { faker } from "@faker-js/faker";
import levelsData from "data/levels";
import membersGen from "data/membersGen";

const helper = {
  sunRadiusFactory: function (ry, o1) {
    return Math.max(ry(o1) - 30, 50);
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
  resetEverything: function ({ svgRef, width, height, setSelection }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    helper.stopAnimation({ svgRef });
    // remove everything in there
    svg.selectAll("*").remove();
    svg.on("click", null);

    // set the attributes
    svg.attr("width", width).attr("height", height);
    // when the svg is clicked clear the current selection
    svg.on("click", function () {
      setSelection(null);
    });
  },

  loadMissionStep: ({ e, setStep, setSelection }) => {
    e.stopPropagation();
    setSelection({ name: "Mission" });
    setStep(2);
  },

  drawOrbits: function ({
    svgRef,
    width,
    height,
    selection,
    setSelection,
    setStep,
  }) {
    const svg = d3.select(svgRef.current);
    const ringOpacity = 0.6;
    const orbits = this.orbitsFactory(width, height);

    const onClick = (e, d) => {
      e.stopPropagation();
      setSelection(d);
      setStep(2 + d.number);
    };

    // put orbit level labels
    svg
      .selectAll("text.orbit-label")
      .data(orbits, (d) => d.number)
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
      .on("click", onClick);

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
  },

  drawSun: function ({
    svgRef,
    width,
    height,
    selection,
    setSelection,
    setStep,
  }) {
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

    const onClick = (e) => {
      helper.loadMissionStep({ e, setStep, setSelection });
    };

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
      .on("click", onClick);

    // draw the text on the sun
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

    // use a tspan for multi-line text (not currently needed)
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

  generateBodies: function ({ width, height, number }) {
    // reset the seed everytime we create members to avoid differences
    var seed = c.cyrb128("apples");
    var rand = c.mulberry32(seed[0]);
    faker.seed(seed);

    const orbits = this.orbitsFactory(width, height);
    const bodies = [];

    var memberAttributes = {
      firstName: "Jeri",
      name: "Jeri",
      love: 2,
      reach: 1,
    };
    var firstMember = membersGen({
      number: 1,
      rand,
      orbit: orbits[3],
      memberAttributes,
    })[0];
    firstMember.showSteps = true;
    bodies.push(firstMember);

    orbits.forEach((orbit) => {
      const membersData = membersGen({ number, rand, orbit });
      for (var i = 0; i < membersData.length; i++) {
        var member = membersData[i];
        bodies.push(member);
      }
    });

    return bodies;
  },

  drawMembers: function ({ svgRef, bodies, selection, setSelection }) {
    var helper = this;
    const svg = d3.select(svgRef.current);

    function onClick(e, d) {
      e.stopPropagation();
      setSelection(d);
    }

    // Create a group for each body
    const bodyGroup = svg
      .selectAll("g.body-group")
      .data(bodies, (d) => d.id)
      .join("g")
      .attr("id", (d) => d.id)
      .attr("class", "body-group");

    // remove the elements and then put new ones on, the join previously
    // will handle the merge; tbd if this way is slower than another one
    bodyGroup.selectAll("*").remove();

    // Draw a circle for each body
    bodyGroup
      .append("circle")
      .attr("class", "planet clickable")
      .attr("r", (d) => d.planetSize)
      .attr("fill", (d) => d.planetColor)
      .attr("stroke", c.backgroundColor)
      .attr("stroke-width", 1)
      .on("click", onClick);

    // Add the name of the body
    bodyGroup
      .append("text")
      .attr("class", `show-me clickable`)
      .attr(
        "fill",
        (d) => selection && selection.name === d.name && c.selectedColor
      )
      .attr("visibility", (d) =>
        selection && selection.name === d.name ? "visible" : "hidden"
      )
      .attr("text-anchor", "left")
      .attr("font-size", (d) => d.fontSize)
      .attr("font-weight", 400)
      .attr("dx", (d) => d.planetSize + 4)
      .attr("dy", 5)
      .text((d) => d.name)
      .on("click", onClick);

    // Draw the first position of the bodies
    // If the bodies haven't been drawn before
    bodyGroup.each(function (body) {
      var self = this;
      var d3Selection = d3.select(self);
      const pathNode = helper.getPathNode(body, body.orbit);
      const pathLength = pathNode.getTotalLength();

      // only apply the initial transform if it hasn't been set before
      if (d3Selection.attr("transform") === null) {
        d3Selection
          .attr("lastTime", body.position)
          .attr("currentTime", 0)
          .attr(
            "transform",
            helper.translate(body.position, pathNode, pathLength)
          );
      }

      // the function passed to data above makes sure the binding doesn't
      // change when we change the element order, so it's safe to raise
      // the selected node so it's above everything else
      if (selection && body.name === selection.name) {
        d3Selection.raise();
      }
    });
  },

  // controls the animations
  transition: function (selection, body, orbit) {
    var helper = this;
    var element = d3.select(selection);

    const pathNode = helper.getPathNode(body, body.orbit);
    const pathLength = pathNode.getTotalLength();

    //  controls how fast the transition moves
    var duration = orbit.revolution;

    d3.select(selection)
      .transition()
      .duration(duration)
      .ease(d3.easeLinear)
      .attrTween("transform", () => {
        return (t) => {
          var lastTime = parseFloat(element.attr("lastTime"));
          var adjustedT = t + lastTime;
          // if we are above 1 (1 revolution) subtract 1 to go back to the beginning
          if (adjustedT > 1) {
            adjustedT -= 1;
          }
          // save the currentTime for restarting the transition at the same place
          element.attr("currentTime", adjustedT);
          return helper.translate(adjustedT, pathNode, pathLength);
        };
      })
      .on("end", () => {
        helper.transition(selection, body, orbit);
      });
  },
  startAnimation: function ({ svgRef }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    const bodyGroup = svg.selectAll("g.body-group");

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

    bodyGroup.each(function (_body, _i) {
      var self = this;
      var element = d3.select(self);
      // only do anything if there is an active transition
      // otherwise it will start another transition
      if (d3.active(self)) {
        // stop the transition by setting an empty transition
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
