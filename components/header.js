import { React, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Image from "next/image";
import Link from "next/link";

import c from "lib/common";
import headerLogo from "public/header_logo.svg";

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
            <a className="flex flex-col items-start text-white">
              <Image
                src={headerLogo}
                alt="Orbit Model logo"
                width={190}
                height={40}
                className="cursor-pointer"
              />
              <div className="font-mono text-sm text-indigo-500">Simulator</div>
            </a>
          </Link>
        </div>

        <div className="flex-1" />
      </nav>
    </>
  );
}
