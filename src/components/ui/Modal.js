import { React } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function Modal({ title, close, children, fullHeight }) {
  return (
    <div className="bg-opacity-50 flex absolute top-0 left-0 z-10 flex-col justify-center items-center p-5 w-full h-full bg-gray-100">
      <div
        className={classnames(
          `flex relative flex-col rounded-sm border border-gray-500`,
          { "w-full h-full": fullHeight }
        )}
      >
        <button
          onClick={close}
          className="flex items-center pt-2 pb-2 px-4 bg-gray-500"
        >
          <div className="text-white">{title}</div>
          <div className="mx-auto" />
          <FontAwesomeIcon icon="xmark" className="text-white" />
        </button>
        <div className="overflow-y-scroll grow bg-white">{children}</div>
      </div>
    </div>
  );
}
