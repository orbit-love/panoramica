import { React } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import classnames from "classnames";

export default function Modal({ title, close, children, fullHeight }) {
  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
      className="flex absolute top-0 left-0 z-10 flex-col justify-center items-center p-5 w-full h-full"
    >
      <div
        className={classnames(
          `theme-border-color theme-inverted flex relative flex-col rounded-sm border-2`,
          { "w-full h-full": fullHeight }
        )}
      >
        <button
          onClick={close}
          className="theme-inverted flex items-center pt-2 pb-2 px-4"
        >
          <div>{title}</div>
          <div className="mx-auto" />
          <FontAwesomeIcon icon="xmark" />
        </button>
        <div className="theme-color theme-background-color overflow-y-scroll grow">
          {children}
        </div>
      </div>
    </div>
  );
}
