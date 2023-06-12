import { useHotkeys } from "react-hotkeys-hook";

import c from "lib/common";
import helper from "lib/visualization/helper";

export default function Shortcuts({
  selection,
  setSelection,
  community,
  levels,
  animate,
  setAnimate,
  revolution,
  setRevolution,
  cycle,
  setCycle,
  showNetwork,
  setShowNetwork,
  showInfo,
  setShowInfo,
  fullscreen,
  setFullscreen,
  showPanel,
  setShowPanel,
}) {
  // the default RPM of the orbits
  const { defaultRevolution, revolutionStep, minRevolution } = c.visualization;

  useHotkeys(
    "right",
    () =>
      setSelection(
        helper.getNextMember({
          selection,
          level: helper.selectedLevel({ selection, levels }),
          community,
        })
      ),
    [selection, community]
  );

  useHotkeys(
    "left",
    () =>
      setSelection(
        helper.getPreviousMember({
          selection,
          level: helper.selectedLevel({ selection, levels }),
          community,
        })
      ),
    [selection, community]
  );
  useHotkeys(
    "up",
    (e) => {
      e.preventDefault();
      var nextLevel = helper.getLevelAtOffset({ selection, levels, offset: 1 });
      setSelection(
        helper.getNextMember({
          selection,
          level: nextLevel,
          community,
          toIndex: 0,
        })
      );
    },
    [selection, community, levels]
  );
  useHotkeys(
    "down",
    (e) => {
      e.preventDefault();
      var nextLevel = helper.getLevelAtOffset({
        selection,
        levels,
        offset: -1,
      });
      setSelection(
        helper.getPreviousMember({
          selection,
          level: nextLevel,
          community,
          toIndex: 0,
        })
      );
    },
    [selection, community, levels]
  );

  useHotkeys("a", () => setAnimate(!animate), [animate, setAnimate]);
  useHotkeys(
    "s",
    () => {
      var newRevolution = revolution - revolutionStep;
      if (newRevolution < minRevolution) newRevolution = defaultRevolution;
      helper.changeTransitionSpeed({
        community,
        levels,
        revolution: newRevolution,
      });
      setRevolution(newRevolution);
    },
    [revolution, setRevolution, community]
  );
  useHotkeys("c", () => setCycle(!cycle), [cycle, setCycle]);
  useHotkeys("n", () => setShowNetwork(!showNetwork), [
    showNetwork,
    setShowNetwork,
  ]);
  useHotkeys("escape", () => setShowNetwork(false), [setShowNetwork]);
  useHotkeys(
    "i",
    () => {
      setShowInfo(!showInfo);
      !showInfo && setShowPanel(true);
    },
    [showInfo, setShowInfo, setShowPanel]
  );
  useHotkeys(
    "o",
    () => {
      setShowPanel(!showPanel);
      !showPanel && setShowInfo(false);
    },
    [showPanel, setShowPanel, setShowInfo]
  );
  useHotkeys(
    "f",
    () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().then(() => {
          setFullscreen(false);
        });
      } else {
        document.body.requestFullscreen().then(() => {
          if (document.fullscreenElement) setFullscreen(true);
        });
      }
    },
    [fullscreen, setFullscreen]
  );

  return <></>;
}
