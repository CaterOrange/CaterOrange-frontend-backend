import React, { createContext, useReducer } from "react";
import reducer from "../context_state_management/reducers/reducer";

export const SignInContext = createContext();

export const SignInProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        isLoading: false,
        data: null,
        isError: false,
        errorMessage: '',
    });

    return (
        <SignInContext.Provider value={{ state, dispatch }}>
            {children}
        </SignInContext.Provider>
    );
};
