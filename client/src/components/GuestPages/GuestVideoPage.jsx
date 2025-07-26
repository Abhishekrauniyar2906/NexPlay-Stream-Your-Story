import React from "react";
import { IoPlayCircleOutline } from "react-icons/io5";
import GuestComponent from "./GuestComponent";

function GuestVideoPage() {
    return (
        <GuestComponent
                    title="Sign in to watch the video"
                    subtitle="Ready to watch? Sign in to start the show!"
                    icon={
                        <span className="w-full h-full flex items-center p-4">
                            <IoPlayCircleOutline className="w-28 h-28" />
                        </span>
                        
                    }
                    route="/"
        />
    );
}

export default GuestVideoPage;