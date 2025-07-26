import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { setUser } from "../../store/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Logo from "../Logo";
import Input from "../Input";
import Button from "../Button";
import { icons } from "../../assets/Icons.jsx";
import axiosInstance from "../../utils/axios.helper.js";
import bg from "../../assets/bg.jpg"

function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const login = async (data) => {
        setError("");
        setLoading(true);
        try {
            const response = await axiosInstance.post("/users/login", data);
            if (response?.data?.data) {
                dispatch(setUser(response.data.data.user));
                localStorage.setItem(
                    "accessToken",
                    response.data.data.accessToken
                );
                toast.success(response.data.message + "🤩");
                navigate("/");
            }
        } catch (error) {
            if (error.status === 401) {
                setError("Invalid password");
            } else if (error.status === 500) {
                setError("Server is not working");
            } else if (error.status === 404) {
                setError("User does not exist");
            } else {
                setError(error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen relative w-full overflow-y-auto  text-white" >
            <img src={`${bg}`}></img>
            <div className="items-center border-5 border-zinc-950 justify-center absolute w-screen md:w-1/2 h-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 backdrop-blur-sm flex flex-col  ">
                <div className=" inline-block">
                    <Link to="/">
                        <Logo />
                    </Link>
                </div>
                <div className="my-4 w-full text-center text-xl font-semibold">
                    Log in to your account
                </div>
                {error && (
                    <p className="text-red-600 mt-4 text-center">{error}</p>
                )}
                <form
                    onSubmit={handleSubmit(login)}
                    className="mx-auto mt-2 flex w-full max-w-sm flex-col px-4"
                >
                    <Input
                        label="Email Address:"
                        placeholder="Enter your email"
                        type="email"
                        className="px-2 rounded-lg"
                        required
                        {...register("email", {
                            required: true,
                            validate: {
                                matchPattern: (value) =>
                                    /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(
                                        value
                                    ) ||
                                    "Email address must be a valid address",
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-red-600 px-2 mt-1">
                            {errors.email.message}
                        </p>
                    )}
                    {errors.email?.type === "required" && (
                        <p className="text-red-600 px-2 mt-1">
                            Email is required
                        </p>
                    )}
                    <Input
                        label="Password:"
                        className="px-2 rounded-lg"
                        className2="pt-5"
                        type="password"
                        placeholder="Enter your password"
                        required
                        {...register("password", {
                            required: true,
                        })}
                    />
                    {errors.password?.type === "required" && (
                        <p className="text-red-600 px-2 mt-1">
                            Password is required
                        </p>
                    )}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="mt-5 bg-[#004D61] hover:bg-[#1e424b] disabled:cursor-not-allowed py-2 rounded-lg"
                        
                    >
                        {loading ? <span>{icons.loading}</span> : "Sign in"}
                    </Button>
                </form>
                <h6 className="mx-auto mt-4">
                    Don't have an Account yet?{" "}
                    <Link
                        to={"/signup"}
                        className="font-semibold text-blue-600 hover:text-blue-500"
                    >
                        Sign up now
                    </Link>
                </h6>
            </div>
            
        </div>
    );
}

export default Login;