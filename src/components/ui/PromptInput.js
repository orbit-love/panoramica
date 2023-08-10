import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Loader from "../domains/ui/Loader";

export default function PromptInput(props) {
  let { prompt, callFunction, setPrompt, disabled, placeholder, loading } =
    props;
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
      onSubmit={callFunction}
      onKeyDown={onKeyDown}
      className="flex flex-col space-y-3 w-full"
    >
      <div
        className="flex relative flex-1 items-stretch h-full md:flex-col"
        role="presentation"
      >
        <div className="flex flex-col w-full py-[10px] flex-grow md:py-4 md:pl-4 relative border border-black/10 bg-gray-100 dark:border-gray-900/50 dark:bg-gray-800 rounded-md shadow-xs dark:shadow-xs">
          <textarea
            ref={textareaRef}
            value={prompt}
            rows={3}
            className="p-0 pl-3 pr-10 m-0 w-full bg-transparent border-0 resize-none focus:ring-0 focus-visible:ring-0 md:pl-0 md:pr-24 dark:text-white dark:bg-transparent"
            placeholder={placeholder}
            disabled={disabled ? "disabled" : ""}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <div className="enabled:bg-brand-purple absolute top-3 right-4 transition-colors disabled:text-gray-400 disabled:opacity-40 md:top-5 md:pl-8">
            <button
              type="submit"
              className="btn h-16 !px-6 !bg-tertiary opacity-80 hover:opacity-90"
              disabled={disabled ? "disabled" : ""}
            >
              {loading && <Loader className="text-white" />}
              {!loading && <FontAwesomeIcon icon="paper-plane" />}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
