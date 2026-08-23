import React, { useState } from "react";
import { ArrowUp, Delete, CornerDownLeft } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (char: string) => void;
  onBackspace: () => void;
  onSubmit: () => void;
  actionLabel?: string;
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onKeyPress,
  onBackspace,
  onSubmit,
}) => {
  const [isShift, setIsShift] = useState<boolean>(false);
  const [isNumeric, setIsNumeric] = useState<boolean>(false);

  const letterRows = [
    ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
    ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
    ["z", "x", "c", "v", "b", "n", "m"],
  ];

  const numRows = [
    ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
    ["-", "/", ":", ";", "(", ")", "$", "&", "@", `"`],
    [".", ",", "?", "!", `'`, "#", "%"],
  ];

  const activeRows = isNumeric ? numRows : letterRows;

  const handleKeyClick = (key: string) => {
    const output = isShift ? key.toUpperCase() : key;
    onKeyPress(output);
    if (isShift) setIsShift(false);
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-2xl p-2 rounded-3xl border border-white/10 select-none shadow-2xl space-y-1.5 animate-in slide-in-from-bottom duration-300">
      {/* Row 1 */}
      <div className="flex justify-center gap-1.5">
        {activeRows[0].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKeyClick(k)}
            className="flex-1 max-w-[34px] h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 active:scale-95 border border-white/15 text-white font-medium text-sm flex items-center justify-center shadow-xs transition backdrop-blur-md"
          >
            {isShift ? k.toUpperCase() : k}
          </button>
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex justify-center gap-1.5 px-3">
        {activeRows[1].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKeyClick(k)}
            className="flex-1 max-w-[34px] h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 active:scale-95 border border-white/15 text-white font-medium text-sm flex items-center justify-center shadow-xs transition backdrop-blur-md"
          >
            {isShift ? k.toUpperCase() : k}
          </button>
        ))}
      </div>

      {/* Row 3 (with Shift & Backspace) */}
      <div className="flex justify-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsShift(!isShift)}
          className={`w-10 h-10 rounded-xl border border-white/15 text-white font-medium text-xs flex items-center justify-center shadow-xs transition backdrop-blur-md ${
            isShift ? "bg-white text-[#141414]" : "bg-white/20 active:bg-white/30"
          }`}
        >
          <ArrowUp size={16} strokeWidth={isShift ? 3 : 2} />
        </button>

        {activeRows[2].map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => handleKeyClick(k)}
            className="flex-1 max-w-[34px] h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 active:scale-95 border border-white/15 text-white font-medium text-sm flex items-center justify-center shadow-xs transition backdrop-blur-md"
          >
            {isShift ? k.toUpperCase() : k}
          </button>
        ))}

        <button
          type="button"
          onClick={onBackspace}
          className="w-10 h-10 rounded-xl bg-white/20 active:bg-white/30 border border-white/15 text-white font-medium text-xs flex items-center justify-center shadow-xs transition backdrop-blur-md"
        >
          <Delete size={17} />
        </button>
      </div>

      {/* Row 4 (Mode, Space, Return) */}
      <div className="flex justify-between gap-1.5 pt-0.5">
        <button
          type="button"
          onClick={() => setIsNumeric(!isNumeric)}
          className="w-14 h-10 rounded-xl bg-white/20 active:bg-white/30 border border-white/15 text-white font-semibold text-xs flex items-center justify-center shadow-xs transition backdrop-blur-md"
        >
          {isNumeric ? "ABC" : "123"}
        </button>

        <button
          type="button"
          onClick={() => onKeyPress(" ")}
          className="flex-1 h-10 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/35 active:scale-98 border border-white/15 text-white font-medium text-xs flex items-center justify-center shadow-xs transition backdrop-blur-md tracking-wider"
        >
          Space
        </button>

        <button
          type="button"
          onClick={onSubmit}
          className="w-14 h-10 rounded-xl bg-[#007AFF] hover:bg-[#0069D9] active:scale-95 text-white font-bold text-xs flex items-center justify-center shadow-lg shadow-blue-500/30 transition"
        >
          <CornerDownLeft size={16} />
        </button>
      </div>
    </div>
  );
};
