import React from "react";

export default function Buttons({
  step,
  setStep,
  totalSteps,
  onPrevious,
  onNext,
  scrollToIntroduction,
}) {
  const classes =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 hover:bg-indigo-600 rounded-md select-none";
  const finalStep = step === totalSteps;
  return (
    <div className="flex pt-2 space-x-4">
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
          Next
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
          className={classes + " bg-pink-500 hover:bg-pink-400"}
          onClick={scrollToIntroduction}
        >
          Proceed
        </button>
      )}
    </div>
  );
}
