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

  const onFocus = (event) => event.target.select();

  return (
    <Frame>
      <div className="px-6 mt-4 mb-6">
        <div className="font-semibold">Generate JWT Token</div>

        <div className="flex mt-2 space-x-2 bg-gray-100 dark:text-white dark:bg-gray-800">
          <input type="text" defaultValue={jwt} readOnly onClick={onFocus} />
          <button className="btn" onFocus={fetchJWT}>
            {loading && <Loader className="text-white" />}
            {!loading && <FontAwesomeIcon icon="arrows-rotate" />}
          </button>
        </div>

        <p className="mt-4">
          Click the button to generate a token for API access. Save your token
          in a secure location. It will not be shown again.{" "}
        </p>
        <p className="mt-4">Tokens expire after 30 days.</p>
      </div>
    </Frame>
  );
}
