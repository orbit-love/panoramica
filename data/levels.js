import c from "lib/common";

// factor is the relative distance between levels
const factor = 22;
const levels = [
  {
    number: 1,
    name: "Advocates",
    nameSingular: "an Advocate",
    distance: 100 - factor * 3,
    multiplier: 1,
    exponent: 2,
    r1: 13,
    r2: 13,
    r3: 13,
    ringColor: c.indigo600,
    ringOpacity: 0.9,
  },
  {
    number: 2,
    name: "Contributors",
    nameSingular: "a Contributor",
    distance: 100 - factor * 2,
    exponent: 2,
    multiplier: 3,
    r1: 11,
    r2: 11,
    r3: 11,
    ringColor: c.indigo700,
    ringOpacity: 0.7,
  },
  {
    number: 3,
    name: "Participants",
    nameSingular: "a Participant",
    distance: 100 - factor,
    exponent: 2,
    multiplier: 6,
    r1: 9,
    r2: 9,
    r3: 9,
    ringColor: c.indigo800,
    ringOpacity: 0.7,
  },
  {
    number: 4,
    name: "Explorers",
    nameSingular: "an Explorer",
    distance: 100,
    exponent: 2,
    multiplier: 9,
    r1: 7,
    r2: 7,
    r3: 7,
    rxFuzz: 0.0,
    ryFuzz: 0.0,
    ringColor: c.indigo900,
    ringOpacity: 0.6,
  },
];

export default levels;
