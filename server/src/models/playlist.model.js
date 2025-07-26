import mongoose,{Schema} from 'mongoose'

const playlistSchema = new Schema({
    
    name:{
        type:String,
        required:true
    },
    discription:{
        type:String
    },
    owner:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:[{
        type:Schema.Types.ObjectId,
        ref:"Video"
    }]

},{timestamps:true})

export const Playlist = mongoose.model("Playlist",playlistSchema)