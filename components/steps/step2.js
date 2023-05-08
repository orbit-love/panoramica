import React, { useEffect } from "react";
import * as d3 from "d3";
import helper from "lib/orbitHelper";
import Buttons from "components/steps/buttons";
import Step2Text from "content/steps/step2.mdx";

export default function Step2({
  svgRef,
  bodies,
  setStep,
  setSelection,
  totalSteps,
}) {
  const member = bodies[0];
  const selector = `g.body-group#${member.id}`;
  useEffect(() => {
    const svg = d3.select(svgRef.current);
    helper.clearSelection(svg);
    helper.highlightSelection(selector);
    setSelection(member);
  }, []);
  return (
    <div className="flex flex-col space-y-6">
      <Step2Text />
      <Buttons step={2} setStep={setStep} totalSteps={totalSteps} />
    </div>
  );
}
