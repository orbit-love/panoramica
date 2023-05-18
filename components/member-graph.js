import React, { useEffect, useState, useRef } from "react";
import Head from "components/head";
import c from "lib/common";
import helper from "lib/visualization/helper";
import Graph from "components/mdx/graph";

export default function MemberGraph({ width, height, members }) {
  var data;

  var nodes = members.list.map((member) => {
    return {
      id: member.id,
      label: member.name.slice(0, 2).toUpperCase(),
      size: 17 + (5 - member.level.number) * 15,
    };
  });

  var seed = c.cyrb128("apples");
  var rand = c.mulberry32(seed[0]);
  var edges = [];
  members.list.map((member) => {
    var min = 0,
      max = members.length();
    var memberEdges = [];
    var connectedMembers = Math.floor(rand() * 3);
    for (var i = 0; i < connectedMembers; i++) {
      var otherMemberIndex = Math.floor(rand() * (max - min + 1) + min);
      var otherMember = members.list[otherMemberIndex];
      if (otherMember) {
        edges.push({
          source: member.id,
          target: otherMember.id,
        });
      }
    }
    return memberEdges;
  });

  data = { nodes, edges };

  return (
    <>
      <Graph data={data} width={width} height={height} />
    </>
  );
}
