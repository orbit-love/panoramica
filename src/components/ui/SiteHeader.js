import { React, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function SiteHeader() {
  const [active, setActive] = useState(false);
  const handleClick = () => {
    setActive(!active);
  };

  return (
    <>
      <nav
        className={`flex absolute z-50 items-center px-2 py-3 w-full whitespace-nowrap md:px-5`}
      >
        <div>
          <button
            className="-mt-2 inline-flex justify-center p-3 mr-2 w-10 text-white rounded outline-none pointer-events-auto hover:text-white hover:bg-indigo-900 md:hidden"
            onClick={handleClick}
          >
            {active ? (
              <FontAwesomeIcon icon="times" size="1x" />
            ) : (
              <FontAwesomeIcon icon="bars" size="1x" />
            )}
          </button>
        </div>
        <Link href="/" passHref>
          <div className="flex items-center p-1 space-x-3 text-3xl text-indigo-500">
            <div className="flex font-thin">
              <span className="opacity-90 px-[2px]">p</span>
              <span className="opacity-80 px-[2px]">a</span>
              <span className="opacity-80 px-[2px]">n</span>
              <span className="opacity-70 px-[2px]">o</span>
              <span className="opacity-70 px-[2px]">r</span>
              <span className="opacity-60 px-[2px]">a</span>
              <span className="opacity-60 px-[2px]">m</span>
              <span className="opacity-60 px-[2px]">i</span>
              <span className="opacity-60 px-[2px]">c</span>
              <span className="opacity-60 px-[2px]">a</span>
            </div>
          </div>
        </Link>
        <div className="flex-1" />
      </nav>
    </>
  );
}
