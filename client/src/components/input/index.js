import React from "react";

const Input = ({
  label = "",
  name = "",
  type = "text",
  className = "",
  inputClassName = "",
  isRequired = true,
  placeholder = "",
  values = "",
  onChange = () => {},
}) => {
  return (
    <div className={className}>
      <label for={name} class="block mb-2 text-sm font-medium">
        {label}
      </label>
      <input
        type={type}
        id="first_name"
        class={inputClassName}
        placeholder={placeholder}
        required={isRequired}
        value={values}
        onChange={onChange}
      />
    </div>
  );
};

export default Input;
