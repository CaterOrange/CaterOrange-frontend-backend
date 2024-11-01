import axios from 'axios';
import { SUCCESS ,FAILED,REQUEST} from '../types/type';

export const Request = () => ({ type: REQUEST });
export const Success = (payload) => ({
    type: SUCCESS,
    payload
});
export const Failed = (payload) => ({
    type: FAILED,
    payload
});

export const Login_customer = async (customer_email, customer_password, dispatch) => {
    dispatch(Request());
    try {
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/login`,{
            customer_email,
            customer_password
        });

        if (response.data.success) {
            dispatch(Success(response.data.token));
        } else {
            dispatch(Failed(response.data.message));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'An error occurred. Please try again.';
        dispatch(Failed(errorMessage));
    }
};

export const SignUp_customer = async (
    customer_name, 
    customer_phonenumber, 
    customer_email, 
    customer_password,  
    confirm_password, 
    dispatch
) => {
    dispatch(Request());
    try {
        console.log("Dispatching request");
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/register`, {
            customer_name, 
            customer_email,
            customer_password,
            customer_phonenumber,    
            confirm_password, 
        });
        console.log("Response received", response.data);
        if (response.data.success) {
            console.log("Sign-up successful, dispatching success");
            dispatch(Success(response.data.token));
        } else {
            console.log("Sign-up failed, dispatching failed");
            dispatch(Failed(response.data.message));
        }
    } catch (error) {
        console.log("Error occurred", error);
        const errorMessage = error.response ? error.response.data.message : 'An error occurred. Please try again.';
        dispatch(Failed(errorMessage));
    }
};

export const Login_forgotPassword = async (customer_email, customer_password,confirm_password, dispatch) => {

    dispatch(Request());
    try {
        
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/forgotPassword`, {
            customer_email,
            customer_password,
            confirm_password
        });
        
        if (response.data.success) {
            dispatch(Success(response.data.token));
            console.log("password changed successfully")
        } else {
            dispatch(Failed(response.data.message));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'An error occurred. Please try again.';
        dispatch(Failed(errorMessage));
    }
};

export const Login_google_auth= async(customer_name,customer_email, access_token, dispatch)=>{
    try {
        // Send the user data to the backend for registration
        console.log("google")
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/google_auth`, {
            customer_name,
            customer_email,
            access_token
        }).catch((error) => {
            if (error.response) {
                console.error('Backend responded with an error:', error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error in setting up the request:', error.message);
            }
        });;

        console.log(response.data)
        if (response.data.success) {
            dispatch(Success(response.data.token));
            console.log("google ouath login successful")
            //closeModal(); // Close the modal after successful signup
        } else {
            dispatch(Failed(response.data.message));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Login with google failed!';
        dispatch(Failed(errorMessage));
    }
} //action.js
export const corporate_category = async (dispatch) => {
    dispatch(Request());
    try {
        console.log('Fetching categories...');
        const response = await axios.get(`${process.env.REACT_APP_URL}/api/customer/corporate/categories`);
        console.log('API response:', response.data);
        
        if (response.data.success) {
            return response.data.categories; // Make sure this matches your API response structure
        } else {
            throw new Error(response.data.message || 'Failed to fetch categories');
        }
    } catch (error) {
        console.error('Error in corporate_category:', error);
        const errorMessage = error.response ? error.response.data.message : 'Category data not fetched!';
        dispatch(Failed(errorMessage));
        throw error; // Re-throw the error so it can be caught in the component
    }
};

export const add_address = async  ( address , dispatch ) =>{
    dispatch(Request());
    try {
        console.log('in action',address)
        const token = localStorage.getItem('token'); // Or wherever you store the token
        console.log(token)
        const response = await axios.post(`${process.env.REACT_APP_URL}/api/customer/corporate/addAddress`, {
            address
        }, {
            headers: {
                'token': `${token} `// Pass the token in the Authorization header
            }
        });
        if (response.data.success) {
            dispatch(Success(response.data.token));
        } else {
            dispatch(Failed(response.data.message));
        }
    } catch (error) {
        const errorMessage = error.response ? error.response.data.message : 'Address not added to customer';
        dispatch(Failed(errorMessage));
    }
}