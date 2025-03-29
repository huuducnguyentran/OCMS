import { useContext } from "react";
import { AuthContext } from "./AuthContext"; // Import from AuthContext file

export const useAuth = () => useContext(AuthContext);
