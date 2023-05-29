import c from "lib/common";

const factor = c.orbitModel.distanceBetweenLevels;
const levels = [
  {
    number: 1,
    name: "Advocates",
    nameSingular: "an Advocate",
    distance: 100 - factor * 3,
    multiplier: 1,
    exponent: 100,
    radius: 9,
    ringColor: c.orbitLevelColorScale(1),
    ringOpacity: 0.9,
  },
  {
    number: 2,
    name: "Contributors",
    nameSingular: "a Contributor",
    distance: 100 - factor * 2,
    exponent: 30,
    multiplier: 2,
    radius: 8,
    ringColor: c.orbitLevelColorScale(2),
    ringOpacity: 0.9,
  },
  {
    number: 3,
    name: "Participants",
    nameSingular: "a Participant",
    distance: 100 - factor,
    exponent: 15,
    multiplier: 4,
    radius: 7,
    ringColor: c.orbitLevelColorScale(3),
    ringOpacity: 0.9,
  },
  {
    number: 4,
    name: "Explorers",
    nameSingular: "an Explorer",
    distance: 100,
    exponent: 10,
    multiplier: 6,
    radius: 5,
    rxFuzz: 0.0,
    ryFuzz: 0.0,
    ringColor: c.orbitLevelColorScale(4),
    ringOpacity: 1,
  },
];

export default levels;
