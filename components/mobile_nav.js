import { React } from "react";
import { Link } from "react-scroll";
import { items } from "./items";

export default function MobileNav({ setActive }) {
  return (
    <div
      id="mobile-nav"
      className="flex fixed left-0 top-[75px] z-20 flex-col h-screen bg-[#1E1449] md:hidden"
    >
      <div className="bg-opacity-80 shrink-0 px-10 ml-1 w-screen text-slate-200 whitespace-nowrap bg-[#1E1449] rounded-sm rounded md:block md:px-0 md:w-56 md:border md:border-slate-500">
        <div className="flex flex-col px-2 pt-4 pb-10">
          {items.map((item) => (
            <Link
              key={item.itemId}
              activeClass="!text-indigo-200 font-bold"
              smooth
              spy
              hashSpy
              offset={-100}
              to={item.itemId}
              href={`#${item.itemId}`}
              className="py-1 text-2xl text-indigo-500 hover:text-indigo-600"
              onClick={() => setActive(false)}
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
