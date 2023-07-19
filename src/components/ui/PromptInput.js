import React, { useRef } from "react";

export default function PromptInput(props) {
  let { prompt, fetchPrompt, setPrompt, placeholder } = props;
  let textareaRef = useRef();
  let formRef = useRef();

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
        value={prompt}
        rows={3}
        placeholder={placeholder}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <div className="flex items-end">
        <button className="btn" type="submit">
          Submit
        </button>
      </div>
    </form>
  );
}
