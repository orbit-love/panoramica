import React from "react";
import c from "lib/common";

export default function Footer() {
  return (
    <footer className={`py-6 bg-[${c.purpleBgColor}]`}>
      <div className="text-center text-slate-200">
        💜 Made with Love, Reach, and Gravity by{" "}
        <a className="hover:underline" href="https://orbit.love/">
          Orbit
        </a>
      </div>
    </footer>
  );
}
