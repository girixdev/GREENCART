
import jwt from 'jsonwebtoken'
// Login: /api/seller/login

export const sellerLogin =  async (req,res)=>{
    const {email,password} = req.body;
    try {
        if(password === process.env.SELLER_PASSWORD 
        && email === process.env.SELLER_EMAIL){
            const token = jwt.sign({email},process.env.JWT_SECRET,
                {expiresIn: '7d'})
            //  res.cookie('sellerToken',token,{
            // httpOnly:true, //prevent  client-side Javascript to access cookie
            // secure: process.env.NODE_ENV === 'production', //use secure cookie in production
            // sameSite : process.env.NODE_ENV === 'production'?'none':'strict', //CSRF protection
            // maxAge : 7*24*60*60*1000, //cookie expiration time
            res.cookie('sellerToken',token,{
            httpOnly:true, //prevent  client-side Javascript to access cookie
            secure: true, //use secure cookie in production
            sameSite : 'None', //CSRF protection
            maxAge : 7*24*60*60*1000, //cookie expiration time
        });

        return res.json({success:true,message:"Logged In"});          
    }else{
        return res.json({success:false,message:"Invalid Credentials"});          

    }
    } catch (error) {
        return res.json({success:false,message:error.message});          
        
    }
    
}

//Seller IsAuth : /api/seller/is-auth
export const isSellerAuth = async (req,res)=>{
    try {
        return res.json({success:true});
    } catch (error) {
        console.log(error.message);
        res.json({success:false,message:error.message});
        
    }
}

//Logout Seller: /api/seller/logout

export const sellerLogout = async(req,res)=>{
    try {
        // res.clearCookie('sellerToken',{
        //     httpOnly:true,
        //     secure: process.env.NODE_ENV === 'production', //use secure cookie in production
        //     sameSite : process.env.NODE_ENV === 'production'?'none':'strict', //CSRF protection
        // })
            res.clearCookie('sellerToken', {
            httpOnly: true,
            secure: true,
            sameSite: 'None',
            });

        res.json({success:true,message:"Logged Out"});
        return 
    } catch (error) {
        console.log(error.message);
        return res.json({success:false,message:error.message});
    }
}

