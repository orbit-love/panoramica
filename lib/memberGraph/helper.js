import c from "lib/common";

const helper = {
  getData: ({ members }) => {
    var nodes = members.list.map((member) => {
      const { id } = member;
      const size = 17 + (5 - member.level.number) * 20;
      const label =
        size > 40 ? member.name : member.name.slice(0, 2).toUpperCase();
      var color;
      switch (member.level.number) {
        case 1:
          color = c.indigo600;
          break;
        case 2:
          color = c.indigo700;
          break;
        case 3:
          color = c.indigo800;
          break;
        case 4:
          color = c.indigo900;
          break;
      }
      return {
        id,
        label,
        member,
        size,
      };
    });
    var edges = [];
    members.connections.forEach((idPair) => {
      const [source, target] = idPair.split("-");
      edges.push({
        source,
        target,
      });
    });
    return { nodes, edges };
  },
};

export default helper;
