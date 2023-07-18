import { React } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Modal({ title, close, children }) {
  return (
    <div className="bg-opacity-80 flex absolute top-0 left-0 z-10 flex-col justify-center items-center p-5 w-full h-full bg-gray-50">
      <div className="flex relative flex-col rounded-sm border border-indigo-900">
        <button
          onClick={close}
          className="flex items-center pt-2 pb-2 px-4 bg-indigo-900"
        >
          <div className="text-sm text-white">{title}</div>
          <div className="absolute top-1 right-3">
            <FontAwesomeIcon icon="xmark" className="text-white" />
          </div>
        </button>
        <div className="overflow-y-scroll grow bg-white">{children}</div>
      </div>
    </div>
  );
}
