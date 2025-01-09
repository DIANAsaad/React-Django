import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios, {AxiosError} from "axios";
import { ReactNode } from "react";
import useLocalStorage from "../hooks/use-local-storage";

// Define User type
interface AchieveUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

// Define AuthContext type
interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  user: AchieveUser | null;
}

// Define AuthProviderProps
interface AuthProviderProps {
  children: ReactNode;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useLocalStorage("access_token", null);
  const [refreshToken, setRefreshToken] = useLocalStorage(
    "refresh_token",
    null
  );

  const [user, setUser] = useState<AchieveUser | null>(null);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;
  
    const controller = new AbortController(); // Create AbortController
    const timeoutId = setTimeout(() => {
      controller.abort(); // Abort request after 5 minutes
    }, 300_000); // 5 minutes = 300,000 milliseconds
  
    try {
      const { data } = await axios.post(
        "http://127.0.0.1:8000/refresh_access_token",
        { refresh_token: refreshToken },
        {
          headers: { "Content-Type": "application/json" },
          signal: controller.signal, // Pass the signal to axios
        }
      );
  
      // Clear the timeout if the request succeeds
      clearTimeout(timeoutId);
  
      setAccessToken(data.access_token);
      setRefreshToken(data.refresh_token);
    } catch (error) {
      if (axios.isAxiosError(error) && error.code === 'ECONNABORTED') {
        console.error("Request timed out");
      } else {
        const axiosError = error as AxiosError; // Type assertion to AxiosError
        console.error("Failed to refresh access token", axiosError?.message);
      }
  
      setAccessToken(null);
      setRefreshToken(null);
    }
  }, [refreshToken, setAccessToken, setRefreshToken]);

  const fetchAndSetUser = useCallback(async () => {
    if (!accessToken) return;

    try {
      const { data } = await axios.get("http://127.0.0.1:8000/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user", error);
      setUser(null);
    }
  }, [accessToken]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await axios.post(
          "http://127.0.0.1:8000",
          { email, password },
          { headers: { "Content-Type": "application/json" } }
        );

        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(data.user);
      } catch (error) {
        console.error("Login failed", error);
      }
    },
    [setAccessToken, setRefreshToken]
  );

  const logout = useCallback(async () => {
    try {
      await axios.post(
        "http://127.0.0.1:8000/logout",
        { refresh_token: refreshToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      setUser(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  }, [accessToken, refreshToken]);

  useEffect(() => {
    if (accessToken) {
      // Fetch user with the current token
      fetchAndSetUser();
  
      // Optionally refresh the access token if it's about to expire
      const refreshInterval = setInterval(() => {
        refreshAccessToken(); // Refresh the token periodically
      }, 5 * 60 * 1000); // Refresh every 5 minutes
  
      return () => clearInterval(refreshInterval); // Clean up the interval when component unmounts
    }
  }, [accessToken, fetchAndSetUser, refreshAccessToken]);
  



  return (
    <AuthContext.Provider
      value={{ login, logout, isAuthenticated: !!user, user }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
