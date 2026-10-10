import { useEffect, type RefObject } from "react";

/**
 * The auth layout centers its form vertically. Centering means any height
 * change (an error message appearing, moving to the next step) shifts the
 * whole form up or down. Once laid out, this pins the element at its centered
 * position: it looks the same, but from then on it only grows downward.
 */
export function usePinnedPosition(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const root = ref.current;
    const parent = root?.parentElement;
    if (!root || !parent) return;

    const pin = () => {
      root.style.alignSelf = "";
      root.style.marginTop = "";
      const offset =
        root.getBoundingClientRect().top -
        parent.getBoundingClientRect().top -
        parseFloat(getComputedStyle(parent).paddingTop);
      root.style.alignSelf = "flex-start";
      root.style.marginTop = `${Math.max(0, Math.round(offset))}px`;
    };

    pin();
    window.addEventListener("resize", pin);
    return () => window.removeEventListener("resize", pin);
  }, [ref]);
}
