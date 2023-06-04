export default class MemberCollection {
  constructor({}) {
    // internal array to get the members
    this.list = [];
    // internal set for the connections between members
    this.connections = new Set();
  }

  find(id) {
    return this.list.find((member) => member.id == id);
  }

  filterMembers({ levelNumber }) {
    return this.list.filter((member) => member.level === levelNumber);
  }

  sort({ sort, levels }) {
    const self = this;
    const newList = [];

    Object.values(levels).forEach((level) => {
      var levelMembers = self.filterMembers({ levelNumber: level.number });

      // sort the members and add to new list
      switch (sort) {
        case "love":
          levelMembers.sort((b, a) => a.love - b.love);
          break;
        case "reach":
          // sort by connection length here directly since reach is based on that
          levelMembers.sort((b, a) => a.reach - b.reach);
          break;
        case "delta":
          levelMembers.sort(
            (b, a) => Math.abs(a.reach - a.love) - Math.abs(b.reach - b.love)
          );
          break;
        case "gravity":
          levelMembers.sort((b, a) => a.love * a.reach - b.love * b.reach);
          break;
      }
      newList.push(...levelMembers);
    });
    this.list = newList;
  }

  // take the OL to the power of exponent for the number of copies
  getUnpackedMembers() {
    const unpackedMembers = [];
    this.list.forEach((member) => {
      // create 1, 8, 27, 64
      var copies = member.level.exponent;
      for (var i = 0; i < copies; i++) {
        unpackedMembers.push(member);
      }
    });
    return unpackedMembers;
  }

  // level is the new level
  changeLevel({ id, level, love = 1 }) {
    const member = this.find(id);

    // update the attributes of the old member
    member.level = level;
    member.love = love;

    // indicate to drawMembers that the animation and attributes
    // of this member need to be changed on the next render
    member.reset = true;
  }

  length() {
    return this.list.length;
  }

  getConnectionSetKeys(member) {
    const setKeys = [];
    this.connections.forEach((setKey) => {
      const [id1, id2] = setKey.split("-");
      if (id1 === member.id || id2 === member.id) {
        setKeys.push(setKey);
      }
    });
    return setKeys;
  }

  // return the connections for a single member
  getConnections({ member }) {
    const connectedMembers = [];
    this.connections.forEach((idPair) => {
      const [id1, id2] = idPair.split("-");
      if (id1 === member.id) {
        connectedMembers.push(this.find(id2));
      }
      if (id2 === member.id) {
        connectedMembers.push(this.find(id1));
      }
    });
    return connectedMembers;
  }
}
