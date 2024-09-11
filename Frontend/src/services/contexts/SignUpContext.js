import React, { createContext, useReducer } from "react";
import reducer from "../context_state_management/reducers/reducer";

export const SignUpContext = createContext();

export const SignUpProvider = ({ children }) => {
    const [state, dispatch] = useReducer(reducer, {
        isLoading: false,
        data: null,
        isError: false,
        errorMessage: '',
    });

    return (
        <SignUpContext.Provider value={{ state, dispatch }}>
            {children}
        </SignUpContext.Provider>
    );
};
