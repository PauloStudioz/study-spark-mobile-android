
import React from "react";
import { Button } from "@/components/ui/button";

interface AutoFlipControlProps {
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  interval: number;
  setInterval: (v: number) => void;
  secondsLeft?: number; // New prop for countdown
}

const intervals = [3, 5, 7, 10];

const AutoFlipControl: React.FC<AutoFlipControlProps> = ({
  isActive,
  setIsActive,
  interval,
  setInterval,
  secondsLeft,
}) => (
  <div className="flex gap-2 items-center">
    <Button
      size="sm"
      variant={isActive ? "default" : "outline"}
      className="rounded-full"
      onClick={() => setIsActive(!isActive)}
    >
      {isActive ? "Auto-Flip On" : "Auto-Flip Off"}
    </Button>
    {isActive && (
      <>
        <span>Every</span>
        <select
          className="border rounded px-2 py-1"
          value={interval}
          onChange={(e) => setInterval(Number(e.target.value))}
        >
          {intervals.map((i) => (
            <option value={i} key={i}>
              {i}s
            </option>
          ))}
        </select>
        {typeof secondsLeft === "number" && (
          <span className="ml-2 text-xs text-gray-500 min-w-[2em]">
            {secondsLeft}s left
          </span>
        )}
      </>
    )}
  </div>
);

export default AutoFlipControl;
