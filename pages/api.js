import Orbits from "components/2023/orbits";
import React, { useEffect, useState, useRef } from "react";
import membersGen from "data/membersGen";

export default function API(req, res) {
  const membersData = membersGen({ number: 50 });
  res.status(200).json(membersData);
}
