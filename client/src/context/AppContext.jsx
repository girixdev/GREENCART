// Import necessary React features and router navigation hook
import { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dummyAddress, dummyProducts } from "../assets/assets";
import toast from "react-hot-toast";
import axios from "axios"

axios.defaults.withCredentials=true; // itll send cookies in api request
axios.defaults.baseURL= import.meta.env.VITE_BACKEND_URL;
// Create a context object (this will hold the shared data)
export const AppContext = createContext();

// This is the Provider component that wraps around your app
// It allows child components to access and update global state
export const AppContextProvider = ({ children }) => {
    
    const currency = import.meta.env.VITE_CURRENCY;
    // Hook to programmatically navigate between routes (e.g., redirect)
    const navigate = useNavigate();

    // user state: stores the current logged-in user info (null if not logged in)
    const [user, setUser] = useState(null);

    // isSeller state: true if the logged-in user is a seller, otherwise false
    const [isSeller, setIsSeller] = useState(false);

    const[showUserLogin, setShowUserLogin] = useState(false);
    const [products,setProducts] = useState([])
    const [cartItems,setCartItems]= useState({})
    const [searchQuery,setSearchQuery] = useState({})

    //fetch seller status
    const fetchSeller = async()=>{
        try {
            const {data} = await axios.get('/api/seller/is-auth');
            if(data.success){
                setIsSeller(true);
            }else{
                setIsSeller(false);
            }
        } catch (error) {
                setIsSeller(false);
            
        }
    }
    //fetch user Auth status, user data and cart items

    const fetchUser = async()=>{
        try {
            const {data} = await axios.get('/api/user/is-auth');
            if(data.success){
                setUser(data.user);
                setCartItems(data.user.cartItems);
            }
        } catch (error) {
            setUser(null);
        }
    }

    const fetchProducts = async ()=>{
        // setProducts(dummyProducts)
        try {
            const {data} = await axios.get('/api/product/list')
            if(data.success){
                setProducts(data.products);
            
            }else{
                toast.error(data.message)
            }
        } catch (error) {
                toast.error(error.message)
            
        }
    }

    //add to cart
    const addToCart = (itemId)=>{
        let cartData = structuredClone(cartItems);

        if(cartData[itemId]){
            cartData[itemId]+=1;
        }else{
            cartData[itemId]=1;
        }
        setCartItems(cartData);
        toast.success("Added to Cart")
    }
    //update cart item quantity
    const updateCartItem = (itemId,quantity)=>{
        let cartData = structuredClone(cartItems);
        cartData[itemId]=quantity;
        setCartItems(cartData);
        toast.success("Cart Updated")

    }

    //Remove Product from cart
    const removeFromCart = (itemId)=>{
        let cartData = structuredClone(cartItems);
        if(cartData[itemId]){
            cartData[itemId]-=1;
             if(cartData[itemId] === 0){
            delete cartData[itemId];
        }
        }
        toast.success("Removed from cart");
        setCartItems(cartData);
    }

    //get cart item count
    const getCartCount = ()=>{
        let totalCount =0;
        for(const item in cartItems){
            totalCount+= cartItems[item];
        }
        return totalCount;
    }

    //get cart total amount
    const getCartAmount = ()=>{
        let totalAmount=0;
        for(const items in cartItems){
            let itemInfo = products.find((product)=> product._id === items);
            if(cartItems[items]>0){
                totalAmount+= itemInfo.offerPrice* cartItems[items];
            }
        }
        return Math.floor(totalAmount*100)/100;
    }
    useEffect(()=>{
        fetchUser();
        fetchSeller();
        fetchProducts()
    },[])
    //update database cart items
    useEffect(()=>{
        const updateCart = async()=>{
            try {
                const {data} = await axios.post('/api/cart/update',{cartItems})
                if(!data.success){
                    toast.error(data.message);
                }
            } catch (error) {
                    toast.error(error.message); 
            }
        }

        if(user){
            updateCart();
        }
    },[cartItems])


    // All the shared data and functions that other components can access
    const value = {
        user,        // user data
        setUser,     // function to update user
        isSeller,    // flag for seller account
        setIsSeller, // function to update seller status
        navigate ,    // router navigation function
        showUserLogin,
        setShowUserLogin,
        products,currency,
        addToCart,updateCartItem,removeFromCart,cartItems,
        searchQuery,setSearchQuery,getCartAmount,getCartCount,
        axios,fetchProducts,setCartItems
    };

    // Return the context provider with all values passed into it
    // All children (components inside this provider) can use the shared values
    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};

// This is a custom hook to simplify context usage in any component
// Instead of importing both useContext and AppContext, you just use this
export const useAppContext = () => {
    return useContext(AppContext); // Gets access to the shared context values
};
