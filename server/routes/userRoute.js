// console.log('Loading userRoute.js'); 

import express from 'express';
import { isAuth, login, logout, register } from '../controllers/userController.js';
import authUser from '../middleware/authUser.js';


const userRouter = express.Router();

userRouter.post('/register',register)
userRouter.post('/login',login)
userRouter.get('/is-auth',authUser,isAuth) //middleware function will be execute before this isAuth to get id from cookie(stroed in token)
userRouter.get('/logout',logout) //middleware function will be execute before this isAuth to get id from cookie(stroed in token)


export default userRouter;