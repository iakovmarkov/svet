import React from "react";

export const Context = React.createContext();
export const withContext = Component => props => (
    <Context.Consumer>
        {(context) => <Component {...props} appContext={context} />}
    </Context.Consumer>
)