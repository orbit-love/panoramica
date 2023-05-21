// probabilities is used during simulation to determine the
// chance that an activity of a certain type will have different attributes
// setting newMember to 0 means that a member will never be created
// level probabilities means that X % of the time the member chosen will
// come from that orbit level
const activityTypes = [
  {
    name: "Attended Meetup",
    level: "Participant",
    probabilities: {
      newMember: 0.1,
      connections: 1,
      level1: 10,
      level2: 20,
      level3: 60,
      level4: 10,
    },
  },
  {
    name: "Joined forum",
    level: "Explorer",
    probabilities: {
      newMember: 0.3,
      connections: 0,
    },
  },
  {
    name: "Led workshop",
    level: "Contributor",
    probabilities: {
      newMember: 0,
      connections: 1,
    },
  },
  {
    name: "Gave talk",
    level: "Advocate",
    probabilities: {
      newMember: 0,
      connections: 0.5,
    },
  },
];

export default activityTypes;
