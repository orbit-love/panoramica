import { React, useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import c from "lib/common";

export default function Header({ fix }) {
  const [active, setActive] = useState(false);
  const handleClick = () => {
    setActive(!active);
  };

  const fixClass = fix
    ? `fixed top-0 left-0 bg-[${c.purpleBgColor}] bg-[#1D1640] z-40`
    : "absolute";

  return (
    <>
      <nav
        className={`${fixClass} flex z-30 items-center px-2 py-3 w-full whitespace-nowrap pointer-events-none md:px-5`}
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

        <div className="pointer-events-auto">
          <Link href="/" passHref>
            <div className="flex items-center p-1 space-x-3 text-3xl text-indigo-500">
              <FontAwesomeIcon
                icon={["fad", "telescope"]}
                className="text-2xl"
                style={{
                  "--fa-primary-color": c.colors.indigo[500],
                  "--fa-secondary-color": c.colors.indigo[600],
                }}
              />
              <div className="flex font-thin">
                <span className="opacity-90 px-[2px]">t</span>
                <span className="opacity-80 px-[2px]">e</span>
                <span className="opacity-80 px-[2px]">l</span>
                <span className="opacity-70 px-[2px]">e</span>
                <span className="opacity-70 px-[2px]">s</span>
                <span className="opacity-60 px-[2px]">c</span>
                <span className="opacity-60 px-[2px]">o</span>
                <span className="opacity-50 px-[2px]">p</span>
                <span className="opacity-50 px-[2px]">e</span>
              </div>
            </div>
          </Link>
        </div>

        <div className="flex-1" />
      </nav>
    </>
  );
}
