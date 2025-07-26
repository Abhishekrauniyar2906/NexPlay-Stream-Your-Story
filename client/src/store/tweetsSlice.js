import {createSlice} from '@reduxjs/toolkit'

const initialState ={
    tweets: [],
}

const tweetSlice = createSlice({
    name:"tweets",
    initialState,
    reducers:{
        // addTweets: (state,action)=>{
        //     // state.tweets= [...state.tweets, ...action.payload]
        //     // push modifies the existing array, instead of creating a new one. This can be more efficient when adding multiple items
        //     state.tweets=action.payload
        // },

        setTweets: (state, action) =>  {
            state.tweets = action.payload;
        },

        addTweets: (state, action) => {
            state.tweets = [action.payload, ...state.tweets]
        },
        removeTweets: (action,state)=>{
            state.tweets=[]
        },
        deleteTweet: (state,action)=>{
            state.tweets = state.tweets.filter(tweet => tweet.id !== action.payload);
        },
        updateTweet: (state,action)=>{
            state.tweets= state.tweets.map((tweet)=>tweet._id===action.payload._id? action.payload : tweet)
        },
        toggleLike: (state,action)=>{
            state.tweets = state.tweets.map((tweet)=>tweet._id===action.payload.tweetId ? {
                ...tweet,
                isLiked: action.payload.isLiked,
                likesCount: action.payload.likesCount
            }:tweet)
        }

    }
})

export const {addTweets, removeTweets, deleteTweet, setTweets,updateTweet, toggleLike} = tweetSlice.actions

export default tweetSlice.reducer