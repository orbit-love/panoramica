import { React } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function Modal({ title, close, children, fullHeight }) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="bg-opacity-90 dark:bg-opacity-90 flex absolute top-0 left-0 z-10 flex-col justify-center items-center p-5 w-full h-full bg-white dark:bg-gray-900"
    >
      <div
        className={classnames(
          `flex relative flex-col bg-white rounded-sm border-2 border-gray-300 dark:bg-gray-900 dark:border-gray-800`,
          { "w-full h-full": fullHeight }
        )}
      >
        <button
          onClick={close}
          className="flex items-center pt-2 pb-2 px-4 bg-gray-300 dark:bg-gray-800"
        >
          <div>{title}</div>
          <div className="mx-auto" />
          <FontAwesomeIcon icon="xmark" />
        </button>
        <div className="overflow-y-scroll grow">{children}</div>
      </div>
    </div>
  );
}
