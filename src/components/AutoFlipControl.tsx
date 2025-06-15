
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface AutoFlipControlProps {
  isActive: boolean;
  setIsActive: (v: boolean) => void;
  interval: number;
  setInterval: (v: number) => void;
}

const intervals = [3, 5, 7, 10];

const AutoFlipControl: React.FC<AutoFlipControlProps> = ({
  isActive,
  setIsActive,
  interval,
  setInterval,
}) => (
  <div className="flex gap-2 items-center">
    <Button size="sm" variant={isActive ? "default" : "outline"} className="rounded-full"
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
          onChange={e => setInterval(Number(e.target.value))}
        >
          {intervals.map(i => (
            <option value={i} key={i}>{i}s</option>
          ))}
        </select>
      </>
    )}
  </div>
);

export default AutoFlipControl;
