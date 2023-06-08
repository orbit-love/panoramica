import * as d3 from "d3";

import c from "lib/common";
import memberHelper from "lib/visualization/memberHelper";
import levelsData from "data/levels";

const helper = {
  rxFactory: function (width) {
    return d3
      .scalePow()
      .exponent(1)
      .range([0, (width / 2) * c.visualization.rings.maxWidthPercentage])
      .domain([0, 100]);
  },
  // create a scale for the level y radius
  ryFactory: function (height) {
    return d3
      .scalePow()
      .exponent(1)
      .range([0, (height / 2) * c.visualization.rings.maxHeightPercentage])
      .domain([0, 100]);
  },
  cxFactory: function (width) {
    return width / 2;
  },
  cyFactory: function (height) {
    return height / 2 - c.visualization.rings.centerYOffset;
  },
  isLevelSelected: function (level, selection) {
    return (
      selection?.number === level.number || selection?.level === level.number
    );
  },
  deactivateRings: function (selection) {
    var helper = this;
    d3.selectAll(".level-shape").each(function (level) {
      if (!helper.isLevelSelected(level, selection)) {
        d3.select(this).attr(
          "stroke-opacity",
          c.visualization.rings.shapes.strokeOpacityDefault
        );
      }
    });
  },
  activateRing: function (levelToActivate, selection) {
    var helper = this;
    // go through each level
    d3.selectAll(".level-shape").each(function (level) {
      const isLevelToActivate = level.number === levelToActivate.number;
      // if its the level to activate, do it if it's not already selected
      if (isLevelToActivate) {
        if (!helper.isLevelSelected(levelToActivate, selection)) {
          d3.select(this).attr(
            "stroke-opacity",
            c.visualization.rings.shapes.strokeOpacityActive
          );
        }
        // if its not the level to activate, do nothing if selected or clear the active state
      } else {
        if (!helper.isLevelSelected(level, selection)) {
          d3.select(this).attr(
            "stroke-opacity",
            c.visualization.rings.shapes.strokeOpacityDefault
          );
        }
      }
    });
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

    // combine the raw level data with the rest
    const levels = {};
    levelsData.forEach((levelData) => {
      levels[levelData.number] = {
        ...levelData,
        cx,
        cy,
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

  drawLevels: function ({ svgRef, selection, levels, setSelection }) {
    const helper = this;
    const svg = d3.select(svgRef.current);
    const {
      fontSize,
      fontWeight,
      textYOffset,
      labelStrokeOpacitySelected,
      labelStrokeOpacityDefault,
    } = c.visualization.rings.labels;

    const {
      strokeOpacityDefault,
      strokeOpacityActive,
      strokeOpacitySelected,
      strokeWidth,
      fill,
      fillOpacity,
    } = c.visualization.rings.shapes;

    const onClick = function (e, d) {
      e.stopPropagation();
      if (selection?.level?.number === d.number) {
        setSelection(null);
      } else {
        setSelection(d);
      }
    };

    const strokeOpacity = (d, selection) =>
      helper.isLevelSelected(d, selection)
        ? strokeOpacitySelected
        : strokeOpacityDefault;

    // draw the levels
    svg
      .selectAll("ellipse")
      .data(Object.values(levels).reverse(), (d) => d.number)
      .join("ellipse")
      .attr("id", (d) => `level-shape-${d.number}`)
      .attr("class", "level-shape")
      .attr("stroke", (d) => d.ringColor)
      .attr("rx", (d) => d.rx)
      .attr("ry", (d) => d.ry)
      .attr("cx", (d) => d.cx)
      .attr("cy", (d) => d.cy)
      .attr("fill", fill)
      .attr("fill-opacity", fillOpacity)
      .attr("stroke-opacity", (d) => strokeOpacity(d, selection))
      .attr("stroke-width", strokeWidth)
      .on("click", onClick);

    // put level labels
    svg
      .selectAll("text.level-label")
      .data(Object.values(levels), (d) => d.number)
      .join("text")
      .attr("class", "level-label")
      .attr("text-anchor", "middle")
      .attr("x", (d) => d.cx)
      .attr("y", (d) => d.cy + d.ry + textYOffset)
      .attr("font-size", fontSize)
      .attr("font-weight", fontWeight)
      .attr("fill", (d) => d.ringColor)
      .attr("opacity", (d) =>
        helper.isLevelSelected(d, selection)
          ? labelStrokeOpacitySelected
          : labelStrokeOpacityDefault
      )
      .text((d) => d.name)
      .on("click", onClick);
  },

  drawSun: function ({ svgRef, width, height, selection, setSelection }) {
    const {
      radiusMaxPercentageOfWidth,
      radiusMaxPercentageOfHeight,
      strokeWidth,
      fill,
      stroke,
    } = c.visualization.sun;
    const svg = d3.select(svgRef.current);
    const cx = this.cxFactory(width);
    const cy = this.cyFactory(height);
    const sunRadius = Math.min(
      width * radiusMaxPercentageOfWidth,
      height * radiusMaxPercentageOfHeight
    );
    const sunCy = cy;

    const onClick = (e) => {
      e.stopPropagation();
      setSelection({ name: "Mission" });
    };

    // draw the sun
    svg
      .selectAll("circle.sun")
      .data([1])
      .join("circle")
      .attr("class", "sun clickable")
      .attr("stroke", stroke)
      .attr("fill", fill)
      .attr("stroke-width", selection?.name === "Mission" ? strokeWidth : 0)
      .attr("r", sunRadius)
      .attr("cx", cx)
      .attr("cy", sunCy)
      .on("click", onClick)
      .on("mouseenter", () => helper.deactivateRings(selection));

    // draw the text on the sun
    const { offset, color, fontWeight, fontSize } = c.visualization.sun.text;
    const text = svg
      .selectAll("text.circle-text")
      .data([1])
      .join("text")
      .attr("class", "circle-text pointer-events-none")
      .attr("x", cx)
      .attr("y", sunCy + offset) // push it down so it is in the middle of the circle
      .attr("fill", color)
      .attr("text-anchor", "middle")
      .attr("font-size", fontSize)
      .attr("font-weight", fontWeight);

    // use a tspan for multi-line text (not currently needed)
    text.selectAll("tspan").data([1]).join("tspan").text("Mission");
  },

  // this rotates everyone by 90 degrees so that the first members
  // in each orbit level based on the sort are at 0:00 on the clock
  // and the last ones at 11:59
  translate: function (t, pathNode, pathLength) {
    var shiftedT = t + c.visualization.translateOffset;
    if (shiftedT >= 1) shiftedT -= 1;
    const point = pathNode.getPointAtLength(shiftedT * pathLength);
    return `translate(${point.x}, ${point.y})`;
  },

  getPathNode: function ({ member, levels }) {
    const { rx, ry, level } = member;
    const { cx, cy } = levels[level];
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

  drawMembers: function ({
    animate,
    svgRef,
    members,
    levels,
    selection,
    setSelection,
    setCycle,
    sort,
    prevSort,
    showNetwork,
    revolution,
  }) {
    var helper = this;
    const svg = d3.select(svgRef.current);

    const onClick = function (e, d) {
      e.stopPropagation();
      setCycle(false);
      setSelection(d);
    };

    // set the visual attributes on the member
    var members = {
      list: memberHelper.prepareToRender({ members, levels, sort }),
    };

    const { fontSize, fontWeight, activeFontWeight } =
      c.visualization.members.label;

    // Create a group for each member
    const memberGroup = svg
      .selectAll("g.member-group")
      .data(members.list, (d) => d.id)
      .join("g")
      .attr("id", (d) => d.id)
      .attr("class", "member-group");

    // remove the elements and then put new ones on, the join previously
    // will handle the merge; tbd if this way is slower than another one
    memberGroup.selectAll("*").remove();

    memberGroup.each(function (d) {
      const scaledReach = c.scale123(d.reach);
      var self = this;
      var d3Selection = d3.select(self);
      // draw the biggest ring
      if (scaledReach > 2) {
        d3Selection
          .append("circle")
          .attr("class", "ring-2 clickable")
          .attr("r", d.planetSize + 5)
          .attr("fill", d.planetColor)
          .attr("stroke", c.backgroundColor)
          .attr("stroke-width", 0)
          .on("click", onClick);
      }
      // draw the middle ring
      if (scaledReach > 1) {
        d3Selection
          .append("circle")
          .attr("class", "ring-2 clickable")
          .attr("r", d.reach === 2 ? d.planetSize + 1 : d.planetSize + 3)
          .attr("fill", d.planetColor)
          .attr("stroke", c.backgroundColor)
          .attr("stroke-width", (d) => (d.reach === 2 ? 0 : 2))
          .on("click", onClick);
      }
    });

    // Draw a circle for each member
    memberGroup
      .append("circle")
      .attr("class", "planet clickable")
      .attr("r", (d) => d.planetSize)
      .attr("fill", (d) => d.planetColor)
      .attr("stroke", c.backgroundColor)
      .attr("stroke-width", (d) => (c.scale123(d.reach) === 1 ? 0 : 2))
      .on("click", onClick);

    // Add the name of the member
    memberGroup
      .append("text")
      .attr("class", "member-label clickable")
      .attr("fill", (d) => levels[d.level].ringColor)
      .attr("visibility", (d) =>
        selection?.id === d.id || d.level < 3 ? "visible" : "hidden"
      )
      .attr("opacity", (d) => (selection?.id === d.id ? 1 : 0.5))
      .attr("text-anchor", "left")
      .attr("font-size", fontSize)
      .attr("font-weight", fontWeight)
      .attr("dx", (d) => d.planetSize + 6)
      .attr("dy", 5)
      .text((d) => d.name.split(" ")[0])
      .on("click", onClick);

    // we can't reset positions on every render because it will override animation
    // and clear positions; we should only reset when a member's reset flag is set
    const resetAllPositions =
      !!members.list.find((member) => member.reset) || prevSort !== sort;

    // Draw the first position of the members
    // If the members haven't been drawn before
    Object.values(levels).forEach((level) => {
      var levelMembers = members.list.filter(
        (member) => member.level === level.number
      );

      // now calculate and set the positions
      const positionScale = d3
        .scaleLinear()
        .range([0, 1])
        .domain([0, levelMembers.length]);

      levelMembers.forEach(function (member, index) {
        const groupId = `g.member-group#${member.id}`;
        const d3Selection = d3.select(groupId);
        const pathNode = helper.getPathNode({ member, levels });
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

    if (showNetwork) {
      memberGroup.each(function (member) {
        var self = this;

        const { stroke, strokeOpacity, strokeWidth, strokeDashArray } =
          c.visualization.members.connections;
        const { activeOpacity } = c.visualization.members.label;

        const getRects = ({ source, target }) => {
          const sourceRect = helper.getBoundingRect(source);
          const targetRect = helper.getBoundingRect(target);
          return [sourceRect, targetRect];
        };

        if (member.connections && selection?.id === member.id) {
          d3.select(self)
            .selectAll("line")
            .data(member.connections, (d) => d.id)
            .join("line")
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", (d) => {
              var [sourceRect, targetRect] = getRects({
                source: member,
                target: d,
              });
              if (sourceRect && targetRect) return targetRect.x - sourceRect.x;
            })
            .attr("y2", (d) => {
              var [sourceRect, targetRect] = getRects({
                source: member,
                target: d,
              });
              if (sourceRect && targetRect) return targetRect.y - sourceRect.y;
            })
            .attr("stroke", stroke)
            .attr("stroke-width", strokeWidth)
            .attr("stroke-opacity", strokeOpacity)
            .attr("stroke-dasharray", strokeDashArray)
            .lower();

          // if the global animation is running, the selection may have
          // changed and we need to re-animate the new lines
          if (animate) {
            helper.transitionLines({
              selection: self,
              member,
              revolution: helper.getRevolutionSpeed({ member, revolution }),
            });
          }

          // add the active state to the labels of connections
          member.connections.forEach((connection) => {
            d3.select(`g.member-group#${connection.id}`)
              .select(".member-label")
              .attr("visibility", "visible")
              .attr("opacity", activeOpacity)
              .attr("font-weight", activeFontWeight);
            // raise the connection members above the incoming lines
            d3.select(`g.member-group#${connection.id}`).raise();
          });
        }
      });
    }
  },

  getBoundingRect: function (member) {
    const node = d3
      .select(`g.member-group#${member.id}`)
      .select(".planet")
      .node();
    return node && node.getBoundingClientRect();
  },

  // controls the animations
  transition: function ({ selection, member, revolution, levels }) {
    var helper = this;
    var element = d3.select(selection);

    const pathNode = helper.getPathNode({ member, levels });
    const pathLength = pathNode.getTotalLength();

    // add the transition
    element
      .transition()
      .duration(revolution)
      .ease(d3.easeLinear)
      .attrTween("transform", () => {
        return (t) => {
          var lastTime = parseFloat(element.attr("lastTime"));
          // if lastTime doesn't exist or is NaN for some reason, just ignore it
          var adjustedT = lastTime ? t + lastTime : t;
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
        helper.transition({ selection, member, revolution, levels });
      });

    // start the line transitioning
    helper.transitionLines({ selection, member, revolution });
  },
  transitionLines: function ({ selection, member, revolution }) {
    var helper = this;
    // tween the end of the lines to the target nodes
    d3.select(selection)
      .selectAll("line")
      .transition()
      .duration(revolution)
      .attrTween("x2", (d) => {
        return (_) => {
          const sourceRect = helper.getBoundingRect(member);
          const targetRect = helper.getBoundingRect(d);
          if (sourceRect && targetRect) return targetRect.x - sourceRect.x;
        };
      })
      .attrTween("y2", (d) => {
        return (_) => {
          const sourceRect = helper.getBoundingRect(member);
          const targetRect = helper.getBoundingRect(d);
          if (sourceRect && targetRect) return targetRect.y - sourceRect.y;
        };
      });
  },
  startAnimation: function ({ svgRef, levels, revolution }) {
    var helper = this;
    const svg = d3.select(svgRef.current);
    const memberGroup = svg.selectAll("g.member-group");

    memberGroup.each(function (member) {
      var self = this;
      if (!d3.active(self)) {
        helper.transition({
          selection: self,
          member,
          levels,
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
  selectedLevel: ({ selection, levels }) => {
    if (selection) {
      // an OL is selected
      if (selection.number) {
        return selection;
      }
      // a member is selected
      if (selection.level) {
        return levels[selection.level];
      }
    }
  },
  getNextMember: function ({ selection, level, members, toIndex }) {
    return this.getMemberAtOffset({
      selection,
      level,
      members,
      offset: 1,
      toIndex,
    });
  },
  getPreviousMember: function ({ selection, level, members, toIndex }) {
    return this.getMemberAtOffset({
      selection,
      level,
      members,
      offset: -1,
      toIndex,
    });
  },
  getLevelAtOffset: function ({ selection, levels, offset }) {
    var levelNow = this.selectedLevel({ selection, levels });
    var nextLevelNumber;
    if (levelNow) {
      nextLevelNumber = levelNow?.number + offset;
      if (offset > 0 && nextLevelNumber === 5) {
        nextLevelNumber = 1;
      }
      if (offset < 0 && nextLevelNumber === 0) {
        nextLevelNumber = 4;
      }
    } else {
      if (offset > 0) {
        nextLevelNumber = 1;
      } else {
        nextLevelNumber = 4;
      }
    }
    return levels[nextLevelNumber];
  },
  getMemberAtOffset: function ({ selection, level, members, offset, toIndex }) {
    if (!members) return null;
    var items = members.list;
    if (level) {
      items = members.filterMembers({ levelNumber: level.number });
    }
    var member;
    if (typeof toIndex !== "undefined") {
      member = items[toIndex];
    } else if (selection) {
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
    return revolutionScale(member.level);
  },
  changeTransitionSpeed: function ({ members, levels, revolution }) {
    var helper = this;
    members.list.forEach((member) => {
      const groupId = `g.member-group#${member.id}`;
      const d3Selection = d3.select(groupId);
      const activeTransition = d3.active(d3Selection.node());
      if (parseFloat(d3Selection.attr("currentTime")) !== 0) {
        d3Selection.attr("lastTime", d3Selection.attr("currentTime"));
      }
      if (activeTransition) {
        helper.transition({
          selection: groupId,
          member,
          levels,
          revolution: helper.getRevolutionSpeed({ member, revolution }),
        });
      }
    });
  },
};

export default helper;
