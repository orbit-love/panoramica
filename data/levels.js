import c from "lib/common";

// factor is the relative distance between levels
const factor = 23;
const levels = [
  {
    number: 1,
    name: "Advocates",
    nameSingular: "an Advocate",
    distance: 100 - factor * 3,
    multiplier: 1,
    exponent: 2,
    r1: 11,
    r2: 11,
    r3: 11,
    ringColor: c.orbitLevelColorScale(1),
    ringOpacity: 0.9,
  },
  {
    number: 2,
    name: "Contributors",
    nameSingular: "a Contributor",
    distance: 100 - factor * 2,
    exponent: 2,
    multiplier: 2,
    r1: 9,
    r2: 9,
    r3: 9,
    ringColor: c.orbitLevelColorScale(2),
    ringOpacity: 0.8,
  },
  {
    number: 3,
    name: "Participants",
    nameSingular: "a Participant",
    distance: 100 - factor,
    exponent: 2,
    multiplier: 4,
    r1: 8,
    r2: 8,
    r3: 8,
    ringColor: c.orbitLevelColorScale(3),
    ringOpacity: 0.8,
  },
  {
    number: 4,
    name: "Explorers",
    nameSingular: "an Explorer",
    distance: 100,
    exponent: 2,
    multiplier: 6,
    r1: 6,
    r2: 6,
    r3: 6,
    rxFuzz: 0.0,
    ryFuzz: 0.0,
    ringColor: c.orbitLevelColorScale(4),
    ringOpacity: 0.9,
  },
];

export default levels;
