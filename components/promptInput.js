import React from "react";
import c from "lib/common";

export default function PromptInput(props) {
  let { prompt, fetchPrompt, setPrompt, placeholder } = props;

  return (
    <form onSubmit={fetchPrompt} className="flex flex-col space-y-3">
      <textarea
        className={c.inputClasses}
        value={prompt}
        rows={3}
        required
        placeholder={placeholder}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex items-end">
        <button type="submit" className={c.buttonClasses}>
          Submit
        </button>
      </div>
    </form>
  );
}
