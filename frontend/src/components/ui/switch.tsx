"use client";
import { twMerge } from "tailwind-merge";
import { motion } from "framer-motion";

export const Switch = ({
  checked,
  setChecked,
  disabled = false,
  id,
}: {
  checked: boolean;
  setChecked: (checked: boolean) => void;
  disabled?: boolean;
  id: string;
}) => {
  return (
    <label
      htmlFor={id}
      className={twMerge(
        "h-7 px-1 flex items-center border border-transparent shadow-[inset_0px_0px_12px_rgba(0,0,0,0.25)] rounded-full w-[60px] relative cursor-pointer transition duration-200",
        checked ? "bg-green-500" : "bg-red-500",
        disabled ? "opacity-50 cursor-not-allowed" : ""
      )}
    >
      <motion.div
        initial={{
          width: "20px",
          x: checked ? 32 : 0,
        }}
        animate={{
          height: ["20px", "10px", "20px"],
          width: ["20px", "30px", "20px", "20px"],
          x: checked ? 32 : 0,
        }}
        transition={{
          duration: 0.3,
          delay: 0.1,
        }}
        key={String(checked)}
        className={twMerge(
          "h-[20px] block rounded-full bg-white shadow-md z-10"
        )}
      />
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => !disabled && setChecked(e.target.checked)}
        className="hidden"
        id={id}
        disabled={disabled}
      />
    </label>
  );
}; 