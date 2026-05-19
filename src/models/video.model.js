import mongoose,{Schema} from "mongoose";
import moongooseAggregatePaginate from "mongoose-aggregate-paginate-v2"

const videoSchema = new Schema(
    {
        videoFile:{
            type: String,
            required : true
        },
        thumbnail :{
            type: String,
            required : true
        },
        title :{
            type: String,
            required : true
        },
        description :{
            type: String,
            required : true
        },
        duration :{
            type: Number,
            required : true
        },
        views:{
            type:Number,
            default : 0
        },
        published:{
            type:Boolean,
            default:true
        },
        owner:{
            type : Schema.Types.ObjectId,
            ref : "User"
        }
    },
    {timestamps=true}
)

videoSchema.plugin(moongooseAggregatePaginate)

export const Video = mongoose.model("Video",videoSchema)