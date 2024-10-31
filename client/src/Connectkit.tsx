import {createContext, ReactNode} from "react";

const AuthContext = createContext({});

export default function AuthProvider({children}: {children: ReactNode}) {
  return <AuthContext.Provider value={{}}>{children}</AuthContext.Provider>;
}
