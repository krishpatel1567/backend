import connectDB from "./db/index.js";
import dotenv from "dotenv";
import {app} from "./app.js"

dotenv.config({
    path:"./env"
});

connectDB()
.then(()=>{

app.on("error",(error)=>{
    console.log("error",error)
    throw error
})

app.listen(process.env.PORT || 3000,()=>{
    console.log("Server is running on port",process.env.PORT || 3000)
})

})
.catch((err)=>{
    console.log("MongoDB connection failed",err);
})

// (async ()=>{
//     try{
//         await mongoose.connect(`$(process.env.MONGODB_URI)/${DB_NAME}`)
//         app.on("error",(error)=>{
//             console.log("ERROR",error);
//             throw error
            
//         })
//         app.listen(process.env.PORT || 3000,()=>{
//             console.log("Server is running on port",${process.env.PORT || 3000})
//         })
//     } catch(error){
//         console.error("ERROR:",error)
//         throw err
//     }
// })()