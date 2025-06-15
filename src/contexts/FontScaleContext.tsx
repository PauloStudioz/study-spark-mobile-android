
import React, { createContext, useContext, useState } from "react";

type FontScale = 1 | 2 | 3 | 4;

const fontScaleValues = {
  1: 0.85,
  2: 1,
  3: 1.125,
  4: 1.25
};

export const FontScaleContext = createContext<{
  fontScale: FontScale;
  setFontScale: (v: FontScale) => void;
  scaleValue: number;
}>({
  fontScale: 2,
  setFontScale: () => {},
  scaleValue: 1
});

export const FontScaleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontScale, setFontScale] = useState<FontScale>(
    (parseInt(localStorage.getItem("studymate-font-scale") ?? "2") as FontScale) || 2
  );
  const scaleValue = fontScaleValues[fontScale];

  // Persist font scale selection
  React.useEffect(() => {
    localStorage.setItem("studymate-font-scale", String(fontScale));
  }, [fontScale]);

  return (
    <FontScaleContext.Provider value={{ fontScale, setFontScale, scaleValue }}>
      {children}
    </FontScaleContext.Provider>
  );
};

export const useFontScale = () => useContext(FontScaleContext);
