import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Controls({
  fullscreen,
  setFullscreen,
  showNetwork,
  setShowNetwork,
}) {
  const fullscreenIcon = "expand";
  const networkIcon = "chart-network";
  const missionIcon = "solar-system";

  return (
    <>
      {showNetwork && (
        <button
          className="btn"
          onClick={() => {
            setShowNetwork(false);
          }}
          title="Toggle to solar system view"
        >
          <FontAwesomeIcon
            icon={missionIcon}
            className="text-lg text-indigo-500"
          />
        </button>
      )}
      {!showNetwork && (
        <button
          className="btn"
          onClick={() => {
            setShowNetwork(true);
          }}
          title="Toggle to network view"
        >
          <FontAwesomeIcon
            icon={networkIcon}
            className="text-lg text-indigo-500"
          />
        </button>
      )}
      {fullscreen && (
        <button
          className="btn"
          onClick={() => {
            document.exitFullscreen().then(() => setFullscreen(false));
          }}
          title="Fullscreen"
        >
          <FontAwesomeIcon icon={fullscreenIcon} className="text-lg" />
        </button>
      )}
      {!fullscreen && (
        <button
          className="btn"
          onClick={() => {
            document.body.requestFullscreen().then(() => setFullscreen(true));
          }}
          title="Fullscreen disabled"
        >
          <FontAwesomeIcon
            icon={fullscreenIcon}
            className="text-lg text-indigo-900"
          />
        </button>
      )}
    </>
  );
}
