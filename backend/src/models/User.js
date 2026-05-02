import mongoose from "mongoose";

const userSchema = mongoose.Schema(
    {
        name:{type:String,require:true},
        email:{type:String,require:true,unique:true,trim:true,lowercase:true},
        password:{type:String,require:true},
        avatarUrl:{type:String,default:null},

    },
    {timestamps:true},
);

const User = mongoose.model("User", userSchema);
export default User;