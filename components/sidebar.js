import { React } from "react";
import { Navigation } from "react-minimal-side-navigation";

import { useRouter } from "next/router";
import { items } from "./items";

export default function Sidebar() {
  const router = useRouter();
  const onSelect = ({ itemId }) => {
    // if (itemId.startsWith("/"))
    router.push(itemId);
  };

  return (
    <div className="flex hidden flex-col md:block">
      <div className="shrink-0 px-10 whitespace-nowrap rounded-sm rounded md:px-0 md:w-56">
        <div className="flex flex-col pb-6 px-7">
          <Navigation
            activeItemId={router.pathname}
            items={items}
            onSelect={onSelect}
          ></Navigation>
        </div>
      </div>
    </div>
  );
}
