import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors'
import connectDB from './configs/db.js';
import 'dotenv/config'
import userRouter from './routes/userRoute.js'
import sellerRouter from './routes/sellerRoute.js';
import connectCloudinary from './configs/cloudinary.js';
import productRouter from './routes/productRoute.js';
import cartRouter from './routes/cartRoute.js';
import addressRouter from './routes/addressRoute.js';
import orderRouter from './routes/orderRoute.js';
import { stripeWebhooks } from './controllers/orderController.js';

const port = process.env.PORT || 4000;
const app = express();

//Global middleware to parse JSON request bodies
app.use(express.json()); //all the req coming to this server will be passed using this json method

await connectDB() // The await ensures the server waits for the database connection to be established before proceeding (which is good practice for critical services).
await connectCloudinary();
//allow multiple origins  specifies which frontend URLs are allowed to make requests to this backend, crucial for security in a cross-origin setup.
const allowedOrigins = ['http://localhost:5173',
    'https://greencart-coral.vercel.app'] //url that are allowed to access our backend
//'https://greencart-coral.vercel.app'
app.use(cookieParser());//Global middleware to parse cookies from request headers
app.use(cors({origin: allowedOrigins,credentials:true}));
//MiddleWare Configuration


app.post('/stripe',express.raw({type: 'application/json'}),stripeWebhooks)




app.get('/',(req,res)=>{
    res.send("API WORKING");

})

app.use('/api/user',userRouter);
app.use('/api/seller',sellerRouter);
app.use('/api/product',productRouter);
app.use('/api/cart',cartRouter);
app.use('/api/address',addressRouter);
app.use('/api/order',orderRouter);



app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`)
})