import * as d3 from "d3";
import { faker } from "@faker-js/faker";

import c from "lib/common";
import levelsData from "data/levels";
import MemberCollection from "data/memberCollection";

const helper = {
  rxFactory: function (width) {
    return d3
      .scalePow()
      .exponent(0.9)
      .range([0, width / 2 - 75])
      .domain([0, 100]);
  },
  // create a scale for the level y radius
  ryFactory: function (height) {
    return d3
      .scalePow()
      .exponent(0.85)
      .range([0, (height / 2) * 0.8])
      .domain([0, 100]);
  },
  cxFactory: function (width) {
    return width / 2;
  },
  cyFactory: function (height) {
    return height / 2 - 60;
  },

  // given the data in levels.js and the screen width + height,
  // generate radii, offsets, etc. for drawing
  generateLevels: function ({ width, height }) {
    // create a scale for the level x radius
    const rx = this.rxFactory(width);
    // create a scale for the level y radius
    const ry = this.ryFactory(height);
    // the center where each level ellipse is placed
    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);

    // tighten up the levels at the top
    const yOffsetScale = d3
      .scalePow()
      .exponent(3)
      .range([0, 30])
      .domain([1, 100]);

    // combine the raw level data with the rest
    const levels = {};
    levelsData.forEach((levelData) => {
      levels[levelData.number] = {
        ...levelData,
        cx,
        cy: cy + yOffsetScale(levelData.distance),
        rx: rx(levelData.distance),
        ry: ry(levelData.distance),
      };
    });
    return levels;
  },
  resetEverything: function ({
    svgRef,
    width,
    height,
    setSelection,
    setCycle,
  }) {
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
      setCycle(false);
    });
  },

  drawLevels: function ({
    svgRef,
    selection,
    setStep,
    levels,
    setExpanded,
    setSelection,
  }) {
    const svg = d3.select(svgRef.current);

    const onClick = function (e, d) {
      e.stopPropagation();
      setStep(4 + d.number);
      setExpanded(true);
      setSelection({ name: d.name });
    };

    // put level labels
    svg
      .selectAll("text.level-label")
      .data(Object.values(levels), (d) => d.number)
      .join("text")
      .attr("class", "level-label clickable")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.cx)
      .attr("y", (d) => d.cy + d.ry + 38)
      .attr("font-size", 15)
      .attr("font-weight", 400)
      .attr("fill", (d) =>
        selection && selection.name === d.name ? c.selectedColor : d.ringColor
      )
      .text((d) => d.name)
      .on("click", onClick);

    // draw the levels
    svg
      .selectAll("ellipse")
      .data(Object.values(levels), (d) => d.number)
      .join("ellipse")
      .attr("stroke", (d) =>
        selection && selection.name === d.name ? c.selectedColor : d.ringColor
      )
      .attr("fill", "none")
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("stroke-opacity", (d) => d.ringOpacity || 1)
      .attr("stroke-width", 2);
  },

  drawSun: function ({
    svgRef,
    width,
    height,
    selection,
    setStep,
    setExpanded,
    setSelection,
  }) {
    const svg = d3.select(svgRef.current);
    const ry = this.ryFactory(height);
    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);
    const o1 = levelsData[0].distance;
    const sunRadius = Math.min(Math.max(ry(o1) - 30, 50), 65);
    const sunColor = c.indigo100;
    const strokeColor = c.indigo400;
    const sunCy = cy;

    const onClick = (e) => {
      e.stopPropagation();
      setStep(3);
      setExpanded(true);
      setSelection({ name: "Mission" });
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
      .attr("stroke-width", 4)
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
      .attr("fill", c.backgroundColor)
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

  // this rotates everyone by 90 degrees so that the first members
  // in each orbit level based on the sort are at 0:00 on the clock
  // and the last ones at 11:59
  translate: function (t, pathNode, pathLength) {
    var shiftedT = t + 0.25;
    if (shiftedT >= 1) shiftedT -= 1;
    const point = pathNode.getPointAtLength(shiftedT * pathLength);
    return `translate(${point.x}, ${point.y})`;
  },

  getPathNode: function (member) {
    const { rx, ry, level } = member;
    const { cx, cy } = level;
    // Create an elliptical path using the SVG path A command
    const pathData = `M ${cx - rx},${cy}
          a ${rx} ${ry} 0 1 1 ${rx * 2},0,
          a ${rx} ${ry} 0 1 1 ${rx * -2},0`;

    const pathNode = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "path"
    );
    pathNode.setAttribute("d", pathData);
    return pathNode;
  },

  // advocateCount is the number of advocates,
  // used to determine other level sizes via a multiplier
  generateMembers: function ({ levels, advocateCount }) {
    // reset the seed everytime we create members to avoid differences
    var seed = c.cyrb128("apples");
    var rand = c.mulberry32(seed[0]);
    faker.seed(seed);

    const members = new MemberCollection({ levels, rand });

    Object.keys(levels).forEach((number) => {
      const level = levels[number];
      // produce the number of members requested
      var number = Math.round(level.multiplier * advocateCount);
      members.addMembers({ level, number });

      // if it's level 4, push another member Jeri to the array
      if (level.number === 4) {
        var memberAttributes = {
          name: "Jeri",
          love: 2,
          reach: 2,
        };
        members.addMember({ level, ...memberAttributes });
      }
    });

    // generate the connections now that the members are assigned
    // factor controls how many connections are needed to get reach
    const factor = 20;
    const connectionNumber = advocateCount * factor;
    members.generateConnections({ number: connectionNumber });

    return members;
  },

  drawMembers: function ({
    svgRef,
    members,
    levels,
    selection,
    setSelection,
    setCycle,
    sort,
    prevSort,
  }) {
    var helper = this;
    const svg = d3.select(svgRef.current);

    function onClick(e, d) {
      e.stopPropagation();
      setCycle(false);
      setSelection(d);
    }

    // reassign positions based on the latest data
    // a future optimization will be only to do this if
    // something has changed
    members.prepareToRender({ sort });

    // Create a group for each member
    const memberGroup = svg
      .selectAll("g.member-group")
      .data(members.list, (d) => d.id)
      .join("g")
      .attr("id", (d) => d.id)
      .attr("class", "member-group")
      .attr("opacity", (d) => d.level.ringOpacity + 0.1);

    // remove the elements and then put new ones on, the join previously
    // will handle the merge; tbd if this way is slower than another one
    memberGroup.selectAll("*").remove();

    const ringColor = c.indigo700;
    const strokeWidth = 4;
    const fill = (selection, d) =>
      selection?.id === d.id ? c.selectedColor : ringColor;

    memberGroup.each(function (d) {
      var self = this;
      var d3Selection = d3.select(self);
      // draw the biggest ring
      if (d.reach > 2) {
        d3Selection
          .append("circle")
          .attr("class", "planet clickable")
          .attr("r", d.planetSize + 10)
          .attr("fill", fill(selection, d))
          .attr("stroke", c.backgroundColor)
          .attr("stroke-width", strokeWidth)
          .on("click", onClick);
      }
      // draw the middle ring
      if (d.reach > 1) {
        d3Selection
          .append("circle")
          .attr("class", "planet clickable")
          .attr("r", d.planetSize + 5)
          .attr("fill", fill(selection, d))
          .attr("stroke", c.backgroundColor)
          .attr("stroke-width", strokeWidth)
          .on("click", onClick);
      }
    });

    // Draw a circle for each member
    memberGroup
      .append("circle")
      .attr("class", "planet clickable")
      .attr("r", (d) => d.planetSize)
      .attr("fill", (d) =>
        selection?.id === d.id ? c.selectedColor : d.planetColor
      )
      .attr("stroke", c.backgroundColor)
      .attr("stroke-width", strokeWidth)
      .on("click", onClick);

    // Add the name of the member
    const fontSize = 16;
    memberGroup
      .append("text")
      .attr("class", "show-me pointer-events-none")
      .attr(
        "fill",
        (d) => selection && selection.name === d.name && c.selectedColor
      )
      .attr("visibility", (d) =>
        selection && selection.name === d.name ? "visible" : "hidden"
      )
      .attr("text-anchor", "left")
      .attr("font-size", fontSize)
      .attr("font-weight", 400)
      .attr("dx", (d) => d.planetSize + 4 + d.reach * 4)
      .attr("dy", 5)
      .text((d) => d.name);

    // we can't reset positions on every render because it will override animation
    // and clear positions; we should only reset when a member's reset flag is set
    const resetAllPositions =
      !!members.list.find((member) => member.reset) || prevSort !== sort;

    // Draw the first position of the members
    // If the members haven't been drawn before
    Object.values(levels).forEach((level) => {
      var levelMembers = members.list.filter(
        (member) => member.level.number === level.number
      );

      // now calculate and set the positions
      const positionScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([0, levelMembers.length]);

      levelMembers.forEach(function (member, index) {
        const groupId = `g.member-group#${member.id}`;
        const d3Selection = d3.select(groupId);
        const pathNode = helper.getPathNode(member);
        const pathLength = pathNode.getTotalLength();

        // stop all transitions if we're overriding positions
        // this will make the transform attribute null
        if (resetAllPositions) {
          d3Selection.interrupt();
        }

        // apply the initial transform if it hasn't been set before
        // or if we're resetting all positions
        if (resetAllPositions || d3Selection.attr("transform") === null) {
          const position = positionScale(index);
          member.position = position;

          d3Selection
            .attr("lastTime", position)
            .attr("currentTime", 0)
            .attr(
              "transform",
              helper.translate(position, pathNode, pathLength)
            );
        }

        // remove the reset
        if (member.reset) {
          member.reset = false;
        }

        // the function passed to data above makes sure the binding doesn't
        // change when we change the element order, so it's safe to raise
        // the selected node so it's above everything else
        if (selection && member.id === selection.id) {
          d3Selection.raise();
        }
      });
    });
  },

  // controls the animations
  transition: function ({ selection, member, revolution }) {
    var helper = this;
    var element = d3.select(selection);

    const pathNode = helper.getPathNode(member);
    const pathLength = pathNode.getTotalLength();

    // add the transition
    element
      .transition()
      .duration(revolution)
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
          // update the object's position so that orbit level changes
          // don't put the member back to position 0
          member.position = adjustedT;
          return helper.translate(adjustedT, pathNode, pathLength);
        };
      })
      .on("end", () => {
        helper.transition({ selection, member, revolution });
      });
  },
  startAnimation: function ({ svgRef, revolution }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    const memberGroup = svg.selectAll("g.member-group");

    memberGroup.each(function (member) {
      var self = this;
      if (!d3.active(self)) {
        helper.transition({
          selection: self,
          member,
          revolution: helper.getRevolutionSpeed({ member, revolution }),
        });
      }
    });
  },
  stopAnimation: function ({ svgRef }) {
    const svg = d3.select(svgRef.current);
    const memberGroup = svg.selectAll("g.member-group");

    memberGroup.each(function () {
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
          }, 100);
        }
      }
    });
  },
  getNextMember: function ({ selection, members }) {
    return this.getMemberAtOffset({ selection, members, offset: 1 });
  },
  getPreviousMember: function ({ selection, members }) {
    return this.getMemberAtOffset({ selection, members, offset: -1 });
  },
  getMemberAtOffset: function ({ selection, members, offset }) {
    const items = members.list;
    var member;
    if (selection) {
      var selectionIndex = items.findIndex(
        (element) => element.id === selection.id
      );
      // cover stopping cases for both the
      var isFirstMember = offset < 0 && selectionIndex === 0;
      var isLastMember = offset > 0 && selectionIndex === items.length - 1;
      if (selectionIndex > -1 && !isFirstMember && !isLastMember) {
        member = items[selectionIndex + offset];
      }
    }
    // start at the beginning or end of the members array depending on offset
    if (!member) {
      if (offset > 0) {
        member = items[0];
      } else {
        member = items[items.length - 1];
      }
    }
    return member;
  },
  getRevolutionSpeed: function ({ member, revolution }) {
    // let outer levels revolve more slowly than inner ones so
    // they aren't moving so fast
    const revolutionScale = d3
      .scaleLinear()
      .range([revolution / 3, revolution])
      .domain([1, 4]);
    return revolutionScale(member.level.number);
  },
  changeTransitionSpeed: function ({ members, revolution }) {
    var helper = this;
    members.list.forEach((member) => {
      const groupId = `g.member-group#${member.id}`;
      const d3Selection = d3.select(groupId);
      const activeTransition = d3.active(d3Selection.node());
      if (parseFloat(d3Selection.attr("currentTime")) !== 0) {
        d3Selection.attr("lastTime", d3Selection.attr("currentTime"));
      }
      if (activeTransition) {
        this.transition({
          selection: groupId,
          member,
          revolution: helper.getRevolutionSpeed({ member, revolution }),
        });
      }
    });
  },
};

export default helper;
