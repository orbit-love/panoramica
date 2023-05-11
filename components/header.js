import { React, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CSSTransition } from "react-transition-group";
import Image from "next/image";
import headerLogo from "public/header_logo.svg";

import Link from "next/link";
import MobileNav from "./mobile_nav";

export default function Header({ fix, fullscreen }) {
  const [active, setActive] = useState(false);
  const handleClick = () => {
    setActive(!active);
  };

  const fixClass = fix ? "fixed top-0 left-0 bg-[#1D1640] z-50" : "absolute";
  console.log(fullscreen);

  return (
    <>
      <nav
        className={`${fixClass} flex z-30 items-center px-2 py-4 w-full whitespace-nowrap pointer-events-none md:px-8`}
      >
        <div>
          <button
            className="inline-flex justify-center p-3 mr-2 ml-auto w-10 text-white rounded outline-none pointer-events-auto hover:text-white hover:bg-indigo-900 md:hidden"
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
            <a>
              <Image
                src={headerLogo}
                alt="Orbit Model logo"
                width={190}
                height={40}
                className="cursor-pointer"
              />
            </a>
          </Link>
        </div>

        <div className="flex-1" />

        {!fullscreen && (
          <div className="hidden md:block">
            <div className="flex justify-end items-center">
              <iframe
                src="https://ghbtns.com/github-btn.html?user=orbit-love&repo=orbit-model&type=star&count=true"
                frameBorder="0"
                scrolling="0"
                width="100"
                height="20"
                title="GitHub"
                className="ml-3 mt-4 opacity-90 sm:mt-0 sm:ml-0"
              ></iframe>
            </div>
          </div>
        )}
      </nav>
      <div className={`${active ? "" : "hidden"}`}>
        <CSSTransition in={active} timeout={400} classNames="mobile-nav">
          <MobileNav setActive={setActive} />
        </CSSTransition>
      </div>
    </>
  );
}
