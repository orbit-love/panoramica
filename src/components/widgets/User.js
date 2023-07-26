import React, { useState } from "react";

import { Frame } from "src/components/widgets";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { getJWT } from "src/data/client/fetches";
import Loader from "src/components/domains/ui/Loader";

export default function User() {
  const [jwt, setJwt] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchJWT = async () => {
    await getJWT({
      onSuccess: ({ result }) => {
        setJwt(result);
      },
      setLoading,
    });
  };

  return (
    <Frame>
      <div className="px-6 mt-4 mb-6">
        <div>Generate JWT Token</div>

        <div className="flex mt-2">
          <p className="text-clip overflow-x-auto bg-gray-100 dark:bg-800 w-full py-2 px-2">
            {jwt}
          </p>
          <button className="btn ml-2" onClick={fetchJWT}>
            {loading && <Loader className="text-white" />}
            {!loading && <FontAwesomeIcon icon="arrows-rotate" />}
          </button>
        </div>

        <p className="mt-2">
          Keep your token safe. They will expire after 30 days
        </p>
      </div>
    </Frame>
  );
}
