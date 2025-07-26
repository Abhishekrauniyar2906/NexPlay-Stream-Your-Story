import React, { useEffect, useRef, useState } from "react";
import {
    NavLink,
    Outlet,
    useParams,
    useNavigate,
    useLocation,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { icons } from "../../assets/Icons.jsx";
import { getUserProfile } from "../../hooks/getUserProfile";
import { MdOutlineEdit } from "react-icons/md";
import { FiVideoOff } from "react-icons/fi";
import Button from "../Button.jsx";
import { FaBell, FaCheckCircle } from "react-icons/fa";
import axiosInstance from "../../utils/axios.helper";
import LoginPopup from "../Auth/LoginPopup.jsx";
import GuestComponent from "../GuestPages/GuestComponent.jsx";
import nexplay_cover from "../../assets/nexplay_Cover.png"

function Channel() {
    const dispatch = useDispatch();
    const { username } = useParams();
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [error, setError] = useState("");
    const { status, userData } = useSelector((state) => state.auth);
    const LoginPopupDialog = useRef();
    const location = useLocation();

    useEffect(() => {
        setError("");
        getUserProfile(dispatch, username).then((res) => {
            if (res?.data) {
                setProfile(res?.data);
            } else {
                setError(
                    <GuestComponent
                        title="Channel does not exist"
                        subtitle="There is no channel for given username. Check the username again."
                        icon={
                            <span className="w-full h-full flex items-center p-4">
                                <FiVideoOff className="w-28 h-28" />
                            </span>
                        }
                        guest={false}
                    />
                );
            }
        });
    }, [status, username]);

    const toggleSubscribe = async () => {
        try {
            const response = await axiosInstance.post(
                `/subscriptions/c/${profile._id}`
            );
            if (response.data.success) {
                setProfile({
                    ...profile,
                    isSubscribed: !profile.isSubscribed,
                    subscribersCount: profile.isSubscribed
                        ? profile.subscribersCount - 1
                        : profile.subscribersCount + 1,
                });
            }
        } catch (error) {
            toast.error("Error while toggling subscribe button");
            console.log(error);
        }
    };

    if (error) {
        return error;
    }

    return profile ? (
        <section className="relative w-full pb-[70px] ">
            <div className="relative min-h-[150px] w-full mt-4 pt-[20%]">
                <div className="absolute inset-0 overflow-hidden mx-20  rounded-4xl  ">
                    <img
                        src={profile?.coverImage || nexplay_cover}
                        alt="user"
                        className="object-cover w-full  "
                    />
                </div>
            </div>

            <div className="px-4 pb-4 ">
                <div className="flex flex-wrap  gap-4 pb-4 pt-6">
                    <div className="relative -mt-12 inline-block h-32 w-32 shrink-0 overflow-hidden rounded-full border-2">
                        <img
                            src={profile?.avatar}
                            alt="image"
                            className="h-full w-full object-cover"
                        />
                    </div>
                    <div className="mr-auto inline-block">
                        <h1 className="font-bold text-gray-200 text-xl">
                            {profile?.fullName}
                        </h1>
                        <p className="text-sm text-gray-400">
                            @{profile?.username}
                        </p>
                        <p className="text-sm text-gray-400">
                            {profile?.subscribersCount} Subscribers ·{" "}
                            {profile?.channelsSubscribedToCount} Subscribed
                        </p>
                    </div>
                    <div className="inline-block">
                        {status === true ? (
                            userData?.username === profile?.username ? (
                                <Button
                                    onClick={() => navigate("/settings")}
                                    className="mr-1 flex items-center border-1 border-gray-700 font-semibold transition-all duration-150 ease-in-out active:translate-x-[5px] active:translate-y-[5px] rounded-xl hover:bg-pink-600"
                                    bgColor="bg-pink-700"
                                >
                                    <MdOutlineEdit />
                                    <p className="ml-2 font-semibold"> Edit</p>
                                </Button>
                            ) : (
                                <Button
                                    onClick={toggleSubscribe}
                                    className={`flex items-center px-2 rounded-xl border-gray-800 border-1  text-gray-200 ${
                                        profile?.isSubscribed
                                            ? "bg-pink-700"
                                            : "hover:bg-gray-900"
                                    }`}
                                    textColor="text-black"
                                    bgColor={
                                        profile?.isSubscribed
                                            ? "bg-pink-700"
                                            : "bg-gray-100"
                                    }
                                >
                                    {profile?.isSubscribed ? (
                                        <>
                                            <p className="mr-2 font-semibold">
                                                Subscribed
                                            </p>
                                            <FaCheckCircle />
                                        </>
                                    ) : (
                                        <>
                                            <p className="mr-2 font-semibold">
                                                Subscribe
                                            </p>
                                            <FaBell />
                                        </>
                                    )}
                                </Button>
                            )
                        ) : (
                            <>
                                <LoginPopup
                                    ref={LoginPopupDialog}
                                    message="Login to Subscribe..."
                                    route={location.pathname}
                                />
                                <Button
                                    onClick={() => {
                                        LoginPopupDialog.current.open();
                                    }}
                                    className="flex items-center rounded-lg bg-pink-700"
                                    bgColor="bg-pink-700"
                                    textColor="text-black"
                                >
                                    <p className="mr-2 font-semibold">
                                        Subscribe
                                    </p>
                                    <FaBell />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
                <ul className="no-scrollbar sticky top-0  z-[2] flex flex-row justify-start gap-x-5 overflow-auto border-b-1 border-gray-700 py-1">
                    <li className="">
                        <NavLink
                            to=""
                            end
                            className={({ isActive }) =>
                                isActive
                                    ? "w-full border-b-2 border-gray-100 text-gray-100  px-2 py-1"
                                    : "w-full border-b-2 border-transparent text-gray-500 px-2 py-1"
                            }
                        >
                            <button className="w-full">Videos</button>
                        </NavLink>
                    </li>
                    <li className="">
                        <NavLink
                            to={"playlist"}
                            className={({ isActive }) =>
                                isActive
                                    ? "w-full border-b-2 border-gray-100 text-gray-100  px-2 py-1"
                                    : "w-full border-b-2 border-transparent text-gray-400 px-2 py-1"
                            }
                        >
                            <button className="w-full">Playlist</button>
                        </NavLink>
                    </li>
                    <li className="">
                        <NavLink
                            to={"tweets"}
                            className={({ isActive }) =>
                                isActive
                                    ? "w-full border-b-2 border-gray-100 text-gray-100 px-2 py-1"
                                    : "w-full border-b-2 border-transparent text-gray-400 px-2 py-1"
                            }
                        >
                            <button className="w-full">Tweets</button>
                        </NavLink>
                    </li>
                    <li className="">
                        <NavLink
                            to={"subscribed"}
                            className={({ isActive }) =>
                                isActive
                                    ? "w-full border-b-2 border-gray-100 text-gray-100 px-2 py-1"
                                    : "w-full border-b-2 border-transparent text-gray-400 px-2 py-1"
                            }
                        >
                            <button className="w-full">Subscribed</button>
                        </NavLink>
                    </li>
                    <li className="">
                        <NavLink
                            to={"about"}
                            className={({ isActive }) =>
                                isActive
                                    ? "w-full border-b-2 border-gray-100 text-gray-100 px-2 py-1"
                                    : "w-full border-b-2 border-transparent text-gray-400 px-2 py-1"
                            }
                        >
                            <button className="w-full">About</button>
                        </NavLink>
                    </li>
                </ul>
                <Outlet />
            </div>
        </section>
    ) : (
        <span className="flex justify-center mt-20">{icons.bigLoading}</span>
    );
}

export default Channel;