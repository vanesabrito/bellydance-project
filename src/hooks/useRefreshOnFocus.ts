import { useEffect } from "react";

// Re-fetch data whenever the tab regains focus or becomes visible again.
export function useRefreshOnFocus(callback: () => void) {
  useEffect(() => {
    let timeoutId: number | null = null;

    const trigger = () => {
      if (timeoutId !== null) {
        return;
      }
      timeoutId = window.setTimeout(() => {
        timeoutId = null;
        callback();
      }, 0);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        trigger();
      }
    };

    const handleFocus = () => {
      trigger();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [callback]);
}
