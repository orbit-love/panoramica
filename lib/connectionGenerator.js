// given a list of members, generate a set of connections of a
// certain sized, with some members more likely to have more
// connections than others due to some factor (like OL)
class ConnectionGenerator {
  constructor({ members, rand }) {
    this.rand = rand;
    this.members = members;
  }

  // with a small number of advocates / contributors, every relationship
  // gets created and then we move on to the outer levels
  produceConnections({ number }) {
    const connections = new Set();
    const unpackedMembers = this.members.getUnpackedMembers();
    while (connections.size < number) {
      var member1 = this.getRandomMember(unpackedMembers);
      var member2 = this.getRandomMember(unpackedMembers);
      if (member1.id !== member2.id) {
        // sort the ids in a way that will avoid two entries in the
        // set for either direction
        const setId = this.setKey(member1, member2);
        connections.add(setId);
        // console.log(`Connection ${member1.id} <> ${member2.id}`);
      }
    }
    console.log("Made " + connections.size + " connections");
    return connections;
  }

  setKey(member1, member2) {
    return [member1.id, member2.id].sort().join("-");
  }

  getRandomMember(unpackedMembers) {
    if (!unpackedMembers) {
      unpackedMembers = this.members.getUnpackedMembers();
    }
    var max = unpackedMembers.length;
    var index = Math.floor(this.rand() * max);
    return unpackedMembers[index];
  }
}

export default ConnectionGenerator;
