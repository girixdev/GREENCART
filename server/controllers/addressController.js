
import Address from "../models/address.js"

//ADD address: /api/address/add
export const addAddress = async(req,res)=>{
    try {
        const userId = req.userId; // Always use the authenticated user's ID
        const { address } = req.body
        await Address.create({...address,userId});
        res.json({success:true,message:"Address added successfully"})
    } catch (error) {
        console.log(error.message)
        res.json({sucess:false,message:error.message})
    }
}
//Get address: /api/address/get
export const getAddress = async(req,res)=>{
    try {
    const userId = req.userId; // Always use the authenticated user's ID

    const addresses = await Address.find({userId})
    res.json({success:true,addresses})
    } catch (error) {
        console.log(error.message)
        res.json({sucess:false,message:error.message})
    }
}


