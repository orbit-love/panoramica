import { faker } from "@faker-js/faker";
import c from "lib/common";
import levelsData from "data/levels";
import * as d3 from "d3";

// generate members for a specific orbit level
// number is how many members
const members = function ({ number, rand, orbit, memberAttributes = {} }) {
  var { love, reach, name, firstName, description } = memberAttributes;
  const levelData = levelsData[orbit.number - 1];
  const {
    rxFuzz = 0.1,
    ryFuzz = 0.1,
    positionFuzz = 0.05,
    r1,
    r2,
    r3,
    l1 = c.indigo900,
    l2 = c.indigo400,
    l3 = c.indigo100,
    exponent = 1,
  } = levelData;

  var loveScale = d3.scalePow().exponent(exponent).range([0, 1]).domain([0, 1]);
  var reachScale = d3
    .scalePow()
    .exponent(exponent)
    .range([0, 1])
    .domain([0, 1]);

  var loveScale2 = d3.scaleQuantize().range([1, 2, 3]).domain([0, 1]);
  var reachScale2 = d3.scaleQuantize().range([1, 2, 3]).domain([0, 1]);

  var array = [];
  var memberCount = Math.round(levelData.multiplier * number);

  const positionScale = d3.scaleLinear().range([0, 1]).domain([0, memberCount]);
  const planetSizeScale = d3
    .scaleLinear()
    .range([r1, r2, r3])
    .domain([1, 2, 3]);
  const planetColorScale = d3
    .scaleLinear()
    .domain([1, 2, 3])
    .range([l1, l2, l3]);

  for (var i = 0; i < memberCount; i++) {
    var thisFirstName = firstName || faker.name.firstName();
    var thisName = name || thisFirstName;
    var thisLove = love || loveScale2(loveScale(rand()));
    var thisReach = reach || reachScale2(reachScale(rand()));
    const ofInterest =
      (thisLove === 3 && thisReach === 1) ||
      (thisLove === 1 && thisReach === 3);
    var member = {
      i,
      id: c.slugify(thisName),
      orbit,
      name: thisName,
      firstName: thisFirstName,
      love: thisLove,
      reach: thisReach,
      ofInterest,
      fontSize: 18,
      level: levelData.number,
      rx: c.fuzz(rand, orbit.rx, rxFuzz),
      ry: c.fuzz(rand, orbit.ry, ryFuzz),
      position: c.fuzz(rand, positionScale(i), positionFuzz),
      planetSize: planetSizeScale(thisReach),
      planetColor: planetColorScale(thisLove),
      initials: c.initials(thisName),
    };
    array.push(member);
  }
  // array = array.sort(function (a, b) {
  //   return a.reach - b.reach;
  // });

  return array;
};

export default members;
