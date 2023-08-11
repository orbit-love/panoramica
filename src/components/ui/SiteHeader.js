"use client";

import { React, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";
import classnames from "classnames";

import logo from "public/logo.png";
import ThemeAction from "src/components/domains/bookmarks/ThemeAction";

export default function SiteHeader({ hideLogo, children }) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <>
      <nav
        className={classnames(`flex py-3 px-6 w-full whitespace-nowrap`, {
          absolute: hideLogo,
        })}
      >
        <Link href="/" passHref>
          <div className="flex items-center p-1 space-x-3">
            <Image src={logo} alt="Panoramica logo" width="45" />
            {!hideLogo && (
              <div className="-mt-2 hidden text-3xl font-thin tracking-wider sm:flex sm:visible">
                panoramica
              </div>
            )}
          </div>
        </Link>
        <div className="flex-1" />
        <ThemeAction>
          <FontAwesomeIcon icon={["fas", "brush"]} />
        </ThemeAction>
        {user && !user.fake && (
          <div className="flex flex-col items-end ml-4 space-x-3">
            <div>{session.user.email}</div>
            {children}
            <button className="hover:underline" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
