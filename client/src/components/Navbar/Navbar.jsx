import React from "react";
import Logo from "../Logo";
import Button from "../Button";
import { useSelector } from "react-redux";
import Search from "./Search";
import { Link } from "react-router-dom";

function Navbar() {
    const authStatus = useSelector((state) => state.auth.status);
    const userData = useSelector((state) => state.auth.userData);

    return (<div className="sticky top-0 z-50 ">
        <nav className="flex justify-between items-center  bg-black p-4">
            {/* <Link to="/">
                <Logo />
            </Link> */}
            <Search />
            

            {!authStatus && (
                <div >
                    
                    <Link to="/login">
                        <Button className="cursor-pointer  hover:bg-gray-800 mr-1 rounded transition-all duration-150 px-4 py-2  ease-in-out active:translate-x-[5px] active:translate-y-[5px] sm:w-auto">
                            Log in
                        </Button>
                    </Link>
                    <Link to="/signup">
                        <Button className="cursor-pointer hover:bg-[#1e424b] mr-1 rounded bg-[#004D61] px-4 py-2 text-center transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] sm:w-auto">
                            Sign up
                        </Button>
                    </Link>
                </div>
            )}

            {authStatus && userData && (
                <div className="flex justify-between">
                <Link to={`/channel/${userData.username}`}>
                    <img
                        src={userData.avatar}
                        alt={userData.username}
                        className="object-cover h-10 w-10 shrink-0 rounded-full"
                    />
                </Link></div>
            )}
        </nav></div>
    );
}

export default Navbar;