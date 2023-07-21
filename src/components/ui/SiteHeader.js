import { React, useState } from "react";
import { createPortal } from "react-dom";
import { useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { signOut } from "next-auth/react";

import Modal from "src/components/ui/Modal";
import ThemeSelector from "src/components/ui/ThemeSelector";
import logo from "public/logo.png";

export default function SiteHeader() {
  const { data: session } = useSession();
  const user = session?.user;

  const [editingTheme, setEditingTheme] = useState(false);
  const [active, setActive] = useState(false);
  const handleClick = () => {
    setActive(!active);
  };

  const toggleEditingTheme = () => {
    setEditingTheme(!editingTheme);
  };

  return (
    <>
      <nav className="flex py-3 px-4 w-full whitespace-nowrap">
        <Link href="/" passHref>
          <div className="flex items-center p-1 space-x-3">
            <Image src={logo} alt="Panoramica logo" width="45" />
            <div className="-mt-2 hidden text-3xl font-thin tracking-wider sm:flex sm:visible">
              panoramica
            </div>
          </div>
        </Link>
        <div className="flex-1" />
        {editingTheme &&
          createPortal(
            <Modal title="Change Theme" close={toggleEditingTheme}>
              <ThemeSelector />
            </Modal>,
            document.body
          )}
        <div className="cursor-pointer" onClick={toggleEditingTheme}>
          <FontAwesomeIcon icon={["fas", "brush"]} />
        </div>
        {user && (
          <div className="flex flex-col items-end ml-4 space-x-3">
            <span>{session.user.email}</span>
            <button className="underline" onClick={signOut}>
              Sign out
            </button>
          </div>
        )}
      </nav>
    </>
  );
}
