

import Product from "../models/product.js";
import Order from "../models/Order.js"
import stripe from "stripe";
import User from "../models/user.js"
//Place Order COD: /api/order/cod
export const placeOrderCOD = async(req,res)=>{
    try {
        const userId = req.userId;
        const {items,address} = req.body;
        if(!address || items.length == 0){
            return res.json({success:false,message:"Invalid Data"})
        }
        //calculate  amount using items
        let amount = await items.reduce(async(acc,item)=>{
            const product = await Product.findById(item.product);
            return (await acc)+ product.offerPrice * item.quantity;
        },0)

        //Add tax charge:
        amount += Math.floor(amount*0.02);
        await Order.create({
            userId,
            items,
            address,
            paymentType:"COD",
            amount,
        });
        return res.json({success:true,message:"Order Placed Successfully"})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}
//place order stripe: /api/order/stripe
export const placeOrderStripe = async(req,res)=>{
    try {
        const userId = req.userId;
        const {items,address} = req.body;
        const {origin} = req.headers;
        if(!address || items.length == 0){
            return res.json({success:false,message:"Invalid Data"})
        }

        let productData=[];

        //calculate  amount using items
        let amount = await items.reduce(async(acc,item)=>{
            const product = await Product.findById(item.product);
            productData.push({
                name:product.name,
                price:product.offerPrice,
                quantity: item.quantity,
            })
            return (await acc)+ product.offerPrice * item.quantity;
        },0)

        //Add tax charge:
        amount += Math.floor(amount*0.02);
       const order =  await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType:"Online",
        });

        //Stripe gateway initialize
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        //create line items for stripe
        const line_items = productData.map((item)=>{
            return {
                price_data: {
                    currency: "usd",
                    product_data:{
                        name:item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price*0.02)*100
                },
                quantity:item.quantity,
            }
        })

        //create session
        const session = await stripeInstance.checkout.sessions.create({
           line_items,
           mode:"payment",
           success_url:`${origin}/loader?next=my-orders`,
           cancel_url:`${origin}/cart`,
           metadata: {
            orderId: order._id.toString(),
            userId,
           }
        })

        return res.json({success:true,url:session.url})
    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

//Stripe webhooks to verify payments action: /stripe
export const stripeWebhooks = async (request,response)=>{
    //stripe gateway initialization
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY)
    const sig = request.headers["stripe-signature"];
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
        request.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET);
    } catch (error) {
        res.status(400).send(`Webhook Error: ${error.message}`)
    }

    //handle the event
    switch(event.type){
        case "payment_intent.succeeded":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId,
            });
            const {orderId,userId} = session.data[0].metadata;

            //Mark payment as paid
            await Order.findByIdAndUpdate(orderId,{isPaid:true})
            //clear use cart
            await UserActivation.findByIdAndUpdate(userId,{cartItems:[]})
            break;
        }
        case "payment_intent.failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.id;

            //getting session metadata
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent:paymentIntentId,
            });
            const {orderId} = session.data[0].metadata;
            await Order.findByIdAndDelete(orderId);
            break;
        }
        default:
            console.error(`Unhandled event type ${event.type}`)
            break;
    }
    response.json({received:true})
}


//Get orders by user ID: /api/order/user

export const getUserOrders = async(req,res)=>{
    try {
        const userId = req.userId;
        const orders = await Order.find({
            userId,
            $or: [{paymentType:"COD"},{isPaid:true}]
        }).populate("items.product address").sort({createdAt:-1});
        res.json({success: true,orders});

    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}

//get All orders (for seller/admin) : /api/order/seller
export const getAllOrders = async(req,res)=>{
    try {
        const orders = await Order.find({
            $or: [{paymentType:"COD"},{isPaid:true}]
        }).populate("items.product address").sort({createdAt:-1})
        res.json({success: true,orders});

    } catch (error) {
        return res.json({success:false,message:error.message});
    }
}