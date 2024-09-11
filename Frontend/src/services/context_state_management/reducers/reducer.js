// reducer.js
import { FAILED, REQUEST, SUCCESS } from "../types/type";
const initialState = {
    isLoading: false,
    data: '',
    isError: false,
    errorMessage: ''
};
const reducer = (state = initialState, action) => {
    console.log('Action received:', action);
    switch (action.type) {
        case REQUEST:
            console.log('Handling REQUEST action');
            return { ...state, isLoading: true, isError: false, errorMessage: '' };
        case SUCCESS:
            console.log('Handling SUCCESS action');
            return { ...state, data: action.payload, isLoading: false, isError: false };
        case FAILED:
            console.log('Handling FAILED action');
            return { ...state, isError: true, errorMessage: action.payload, isLoading: false };
        default:
            console.log('Handling default case');
            return state;
    }
};


export default reducer;
