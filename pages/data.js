import React from "react";
import Head from "components/head";
import helper from "lib/visualization/helper";

export default function Data() {
  const width = 500,
    height = 500;
  const levels = helper.generateLevels({ width, height });
  const members = helper.generateMembers({
    levels,
    advocateCount: 2,
  });
  var connections = [];
  members.connections.forEach((idPair) => connections.push(idPair));

  return (
    <>
      <Head />
      {connections.map((idPair, index) => (
        <div key={index} className="my-2">
          {idPair.split("-").join(" ")}
        </div>
      ))}
      {members.list.map((member, index) => (
        <div key={index} className="my-2">
          <pre className="whitespace-wrap w-1/2">{JSON.stringify(member)}</pre>
        </div>
      ))}
    </>
  );
}
