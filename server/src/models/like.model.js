import mongoose,{Schema} from "mongoose"

const likeSchema = new Schema({

    likedBy:{
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    video:{
        type:Schema.Types.ObjectId,
        ref:"video"
    },
    tweet:{
        type:Schema.Types.ObjectId,
        ref:"tweet"
    },
    comment:{
        type:Schema.Types.ObjectId,
        ref:"Comment"
    }
},{timestamps:true})

export const Like = mongoose.model("Like",likeSchema)