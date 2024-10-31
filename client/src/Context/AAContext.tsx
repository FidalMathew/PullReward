import {createContext, ReactNode} from "react";

const AAContext = createContext({});

export default function AAContextProvider({children}: {children: ReactNode}) {
  return <AAContext.Provider value={{}}>{children}</AAContext.Provider>;
}
