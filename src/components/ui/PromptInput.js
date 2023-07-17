import React, { useRef, useEffect } from "react";
import c from "src/configuration/common";

export default function PromptInput(props) {
  let { prompt, fetchPrompt, setPrompt, placeholder } = props;
  let textareaRef = useRef();
  let formRef = useRef();

  useEffect(() => {
    textareaRef.current.focus();
  }, []);

  const onKeyDown = (e) => {
    if (e.keyCode == 13 && e.shiftKey == false) {
      e.preventDefault();
      formRef.current.requestSubmit();
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={fetchPrompt}
      onKeyDown={onKeyDown}
      className="flex flex-col space-y-3 w-full"
    >
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
