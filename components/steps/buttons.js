import React from "react";
import Scroll from "react-scroll";

export default function Buttons({
  step,
  setStep,
  totalSteps,
  onPrevious,
  onNext,
}) {
  const classes =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 rounded-md";
  const finalStep = step === totalSteps;
  return (
    <div className="flex pt-4 space-x-32">
      {!finalStep && step > 1 && (
        <button
          className={classes}
          onClick={() => {
            onPrevious && onPrevious();
            setStep(step - 1);
          }}
        >
          Back
        </button>
      )}
      {!finalStep && (
        <button
          className={classes}
          onClick={() => {
            onNext && onNext();
            setStep(step + 1);
          }}
        >
          {step === 1 ? "Start Exploring" : "Next"}
        </button>
      )}
      {finalStep && (
        <button
          className={classes}
          onClick={() => {
            setStep(1);
          }}
        >
          Start Over
        </button>
      )}
      {finalStep && (
        <button
          className={classes + " bg-pink-500"}
          onClick={() => {
            const scroll = Scroll.animateScroll;
            scroll.scrollTo(window.innerHeight - 100);
          }}
        >
          Proceed
        </button>
      )}
    </div>
  );
}
