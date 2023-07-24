import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function PromptInput(props) {
  let { prompt, fetchPrompt, setPrompt, disabled, placeholder } = props;
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
      <div
        className="relative flex h-full flex-1 items-stretch md:flex-col"
        role="presentation"
      >
        <div className="flex flex-col w-full py-[10px] flex-grow md:py-4 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:bg-gray-700 rounded shadow-xs dark:shadow-xs">
          <textarea
            ref={textareaRef}
            value={prompt}
            rows={3}
            className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-10 focus:ring-0 focus-visible:ring-0 dark:bg-transparent md:pr-20 pl-3 md:pl-0 dark:text-white"
            placeholder={placeholder}
            disabled={disabled ? "disabled" : ""}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="absolute p-1 md:bottom-3 bottom-0 md:right-3 right-0 md:pl-8 md=pt-6 dark:hover:bg-gray-900 dark:disabled:hover:bg-transparent disabled:text-gray-400 enabled:bg-brand-purple text-white transition-colors disabled:opacity-40">
            <button
              type="submit"
              className="btn !bg-tertiary"
              disabled={disabled ? "disabled" : ""}
            >
              <FontAwesomeIcon icon="paper-plane" />
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
