
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export function useHaptics() {
  const vibrate = async (style: keyof typeof ImpactStyle = "Medium") => {
    try {
      await Haptics.impact({ style: ImpactStyle[style] || ImpactStyle.Medium });
    } catch {
      // Ignore if not available
    }
  };
  const notification = async () => {
    try {
      await Haptics.notification({ type: "SUCCESS" });
    } catch {}
  };
  return { vibrate, notification };
}
