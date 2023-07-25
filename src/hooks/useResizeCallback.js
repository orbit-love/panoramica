import { useEffect } from "react";

// This hook will take a reference to a HTML DOM Element, a cutoff width and a callback
// It'll invoke the callback everytime the element gets resized past or below the cutoff width
const useResizeCallback = (ref, cutoffWidth, callback) => {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    let wasBelowCutoffWidth = element.scrollWidth <= cutoffWidth;
    callback(wasBelowCutoffWidth);

    const observer = new ResizeObserver(() => {
      const isBelowCutoffWidth = element.scrollWidth <= cutoffWidth;
      if (isBelowCutoffWidth !== wasBelowCutoffWidth) {
        wasBelowCutoffWidth = isBelowCutoffWidth;
        callback(isBelowCutoffWidth);
      }
    });

    observer.observe(element);

    return () => {
      // Cleanup the observer by unobserving all elements
      observer.disconnect();
    };
  }, []);
};

export default useResizeCallback;
