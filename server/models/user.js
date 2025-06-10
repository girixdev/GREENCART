import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    name : {type:String,required:true},
    email: {type:String,required:true,unique:true},
    password: {type:String,required:true},
    cartItems:{type:Object,default:{}},
},{minimize:false})//controls whether empty objects are removed from the doc
//false ensure that even if cartItems is and empty object it remains in documetn
const User = mongoose.models.user || mongoose.model('user',userSchema)

export default User;