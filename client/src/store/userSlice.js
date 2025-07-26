import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    userVideo: [],
    userPlaylist: null,
    userTweets: [],
    userLikedVideos: [],
    userHistory: [],
    userSubscribed: null,
};

const userSlice = createSlice ({
    name:"user",
    initialState,
    reducers:{
        addUser: (state, action)=>{
            state.user= action.payload
        },
        addUserVideo: (state, action)=>{
            state.userVideo.push(...action.payload)
        },
        removerUserVideo: (state, action) => {
            state.userVideo = []
        },
        addUserPlaylist: (state, action) => {
            state.userPlaylist = action.payload
        },
        addUserTweets: (state, action)=> {
            state.userTweets.push(...action.payload)
        },
        removeUserTweets: (state, action) => {
            state.userTweets =[]
        },
        addUserLikedVideos: (state, action) => {
            state.userLikedVideos.push(...action.payload)  
        },
        removeUserLikedVideos: (state, action) => {
            state.userLikedVideos = []
        },
        addUserHistory: (state, action) => {
            state.userHistory.push(...action.payload)
        },
        removeUserHistory: (state, action) => {
            state.userHistory = []
        },
        addUserSubscribed: (state, action) => {
            state.userSubscribed = action.payload
        },
        toggleUserSubscribe: (state, action) => {
            state.userSubscribed.channels = state.userSubscribed.channels.map((profile)=> profile._id ===action.payload.profileId ?{
                ...profile,
                isSubscribed: action.payload.isSubscribed,
                subscribersCount: action.payload.subscribersCount,
            }:profile)
        }

    }
})

export const {
    addUser,
    addUserVideo,
    removerUserVideo,
    addUserPlaylist,
    addUserTweets,
    removeUserTweets,
    addUserLikedVideos,
    removeUserLikedVideos,
    addUserHistory,
    removeUserHistory,
    addUserSubscribed,
    toggleUserSubscribe,
} = userSlice.actions;

export default userSlice.reducer;