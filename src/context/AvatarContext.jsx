import { createContext, useContext } from "react";

// Create context
export const AvatarContext = createContext();

// Custom hook
export const useAvatar = () => useContext(AvatarContext);
