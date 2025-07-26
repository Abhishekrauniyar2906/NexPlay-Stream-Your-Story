import React from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo.png";

function Logo({ className = "" }) {
    return (
        <div
            className={`font-bold text-xl flex items-center w-full ${className} text-[#e7e7e7]`}
        >
            <img
                src={`${logo}`}
                alt="logo"
                className="w-12 h-12 inline-block mr-2"
            />
            <div>NexPlay</div>
        </div>
    );
}

export default Logo;