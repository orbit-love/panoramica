import React, { useRef, useEffect } from "react";
import c from "lib/common";

export default function PromptInput(props) {
  let { prompt, fetchPrompt, setPrompt, placeholder } = props;
  let textareaRef = useRef();

  // useEffect(() => {
  //   textareaRef.current.focus();
  // }, []);

  return (
    <form onSubmit={fetchPrompt} className="flex flex-col space-y-3 w-full">
      <textarea
        ref={textareaRef}
        className={c.inputClasses}
        value={prompt}
        rows={3}
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
