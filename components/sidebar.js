import { React } from "react";
import {
  Link,
  Button,
  Element,
  Events,
  animateScroll as scroll,
  scrollSpy,
  scroller,
} from "react-scroll";

import { items } from "./items";

export default function Sidebar({ fix }) {
  const fixClass = fix ? "fixed top-28" : "block";

  return (
    <div className={`${fixClass} flex hidden flex-col md:block`}>
      <div className="shrink-0 px-10 whitespace-nowrap rounded-sm rounded md:px-0 md:w-64">
        <div className="flex flex-col px-6 py-7 space-y-2 text-lg bg-violet-100">
          {items.map((item) => (
            <Link
              key={item.itemId}
              activeClass="text-indigo-700"
              smooth
              spy
              hashSpy
              offset={-100}
              to={item.itemId}
              href={`#${item.itemId}`}
              className="hover:text-indigo-500"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
