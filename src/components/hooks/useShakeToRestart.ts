
import { useEffect } from "react";

/**
 * Listen for shake gesture and call reset callback.
 * @param resetCallback will be called on shake trigger.
 * @param vibrate optional haptics method
 */
export function useShakeToRestart(resetCallback: () => void, vibrate?: (style: string) => void) {
  useEffect(() => {
    let lastX: number | null = null, lastY: number | null = null, lastZ: number | null = null;
    let lastTime = 0;
    function handleMotion(e: DeviceMotionEvent) {
      if (!e.accelerationIncludingGravity) return;
      const now = Date.now();
      if (now - lastTime < 400) return;
      const { x, y, z } = e.accelerationIncludingGravity;
      if (lastX !== null && lastY !== null && lastZ !== null) {
        const delta = Math.abs(x! - lastX) + Math.abs(y! - lastY) + Math.abs(z! - lastZ);
        if (delta > 25) {
          // Shake detected
          resetCallback();
          if (vibrate) vibrate("Heavy");
        }
      }
      lastX = x;
      lastY = y;
      lastZ = z;
      lastTime = now;
    }
    window.addEventListener("devicemotion", handleMotion);
    return () => window.removeEventListener("devicemotion", handleMotion);
  }, [resetCallback, vibrate]);
}
