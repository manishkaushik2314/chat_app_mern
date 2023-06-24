import React from "react";

const Button = ({
  label = "Button",
  type = "button",
  className = "",
  disabled = false,
}) => {
  return (
    <button
      type={type}
      className={`bg-secondary hover:bg-border text-white font-bold py-2 px-4 rounded-full ${className} `}
      disabled={disabled}
    >
      {label}
    </button>
  );
};

export default Button;
