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
        className="flex relative flex-1 items-stretch h-full md:flex-col"
        role="presentation"
      >
        <div className="flex flex-col w-full py-[10px] flex-grow md:py-4 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:bg-gray-700 rounded-md shadow-xs dark:shadow-xs">
          <textarea
            ref={textareaRef}
            value={prompt}
            className="p-0 pl-3 pr-10 m-0 w-full bg-transparent border-0 resize-none focus:ring-0 focus-visible:ring-0 md:pl-0 md:pr-24 dark:text-white dark:bg-transparent"
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
