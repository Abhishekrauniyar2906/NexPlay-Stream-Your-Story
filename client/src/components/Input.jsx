import React, { useId } from "react";

const Input = React.forwardRef(function Input(
    { label, type = "text", className = "", className2="", ...props },
    ref
) {
    const id = useId();
    return (
        <div className={`w-full ${className2}`}>
            {label && (
                <label className="inline-block mb-1 pl-1" htmlFor={id}>
                    {label}
                </label>
            )}
            <input
                type={type}
                className={`py-1 hover:bg-gray-950 bg-zinc-900 text-[#e7e7e7] outline-none duration-200 border focus:border-blue-800 border-gray-900 w-full ${className}`}
                ref={ref}
                {...props}
                id={id}
            />
        </div>
    );
});

export default Input;