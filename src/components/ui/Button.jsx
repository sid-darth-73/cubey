import React from "react";

const sizeStyles = {
  md: "px-4 py-2 text-md rounded-md",
  lg: "px-6 py-4 text-xl rounded-xl",
  sm: "px-2 py-1 text-sm rounded-sm",
};

const variantStyles = {
  primary: "bg-[#7164c0] text-white",
  secondary: "bg-[#d9ddee] text-[#9492db]",
};

const defaultStyle = "font-normal cursor-pointer";

export function Button({
  variant = "primary",
  size = "md",
  startIcon: StartIcon,
  endIcon,
  text,
  onClick,
  fullWidth = false,
  loading = false,
}) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={
        sizeStyles[size] +
        " " +
        variantStyles[variant] +
        " " +
        defaultStyle +
        (fullWidth ? " w-full flex justify-center items-center" : "") +
        (loading ? " opacity-45" : "")
      }
    >
      <div className="flex items-center">
        {StartIcon && (
          <span className="text-xs">
            <StartIcon size={size} />
          </span>
        )}
        <div className="pl-2 pr-2">{text}</div>
        {endIcon}
      </div>
    </button>
  );
}
