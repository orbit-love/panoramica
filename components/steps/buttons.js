import React from "react";

export default function Buttons({
  step,
  setStep,
  totalSteps,
  onPrevious,
  onNext,
}) {
  const classes =
    "flex-1 px-2 py-2 text-sm font-semibold bg-indigo-700 rounded-md";
  return (
    <div className="flex space-x-6">
      {step > 1 && (
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
      {step !== totalSteps && (
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
      {step === totalSteps && (
        <button
          className={classes}
          onClick={() => {
            setStep(1);
          }}
        >
          Start Over
        </button>
      )}
    </div>
  );
}
