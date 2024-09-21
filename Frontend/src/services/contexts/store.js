import React, { createContext, useReducer } from "react";
import { composeWithDevTools } from 'redux-devtools-extension';
import reducer from "../context_state_management/reducers/reducer";
export const StoreContext = createContext();

const StoreProvider = ({ children }) => {
    const initialState = {
        isLoading: false,
        data: null,
        isError: false,
        errorMessage: '',
    };

    // Connect to Redux DevTools
    const devTools = process.env.NODE_ENV === 'development' && window._REDUX_DEVTOOLS_EXTENSION_
        ? window._REDUX_DEVTOOLS_EXTENSION_.connect()
        : null;

    const [state, dispatch] = useReducer((state, action) => {
        const newState = reducer(state, action);

        // Send the updated state to Redux DevTools
        if (devTools) {
            devTools.send(action.type, newState);
        }

        return newState;
    }, initialState);


    return (
        <StoreContext.Provider value={{ state, dispatch }}>
            {children}
        </StoreContext.Provider>
    );
};

export default StoreProvider; 