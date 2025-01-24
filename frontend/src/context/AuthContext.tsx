import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ReactNode } from 'react';
import useLocalStorage from '../hooks/use-local-storage';



const TOKEN_EXPIRATION_TIME = 86_400_000; 

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
  isLoading: boolean; // For indicating blocking/loading state
  accessToken: string | null;
}

// Define AuthProviderProps
interface AuthProviderProps {
  children: ReactNode;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useLocalStorage('access_token', localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh_token', localStorage.getItem('refresh_token'));

  const [user, setUser] = useState<AchieveUser | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAndSetUser = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axios.get('http://127.0.0.1:8000/user', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setUser(data);
    } catch (error) {
      console.error('Failed to fetch user', error);
      setUser(null);
    }
  }, [accessToken]);

  const refreshAccessToken = useCallback(async () => {
    if (!refreshToken) return;

    try {
      const { data } = await axios.post(
        'http://127.0.0.1:8000/refresh_access_token',
        { refresh_token: refreshToken },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token;

      if (newAccessToken && newAccessToken !== accessToken) {
        setAccessToken(newAccessToken);
      }
      if (newRefreshToken && newRefreshToken !== refreshToken) {
        setRefreshToken(newRefreshToken);
      }

      await fetchAndSetUser();
    } catch (error) {
      const axiosError = error as AxiosError;
      console.error('Failed to refresh access token', axiosError?.message);

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  }, [accessToken, refreshToken, setAccessToken, setRefreshToken, fetchAndSetUser]);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const { data } = await axios.post(
          'http://127.0.0.1:8000',
          { email, password },
          { headers: { 'Content-Type': 'application/json' } }
        );

        setAccessToken(data.access_token);
        setRefreshToken(data.refresh_token);
        setUser(data.user);
      } catch (error) {
        console.error('Login failed', error);
      }
    },
    [setAccessToken, setRefreshToken]
  );

  const logout = useCallback(async () => {
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
    try {
      // Attempt to logout on the server side
      if (accessToken && refreshToken) {
        await axios.post(
          'http://127.0.0.1:8000/logout',
          { refresh_token: refreshToken },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
      }
    } catch (error) {
      console.error('Logout failed', error);
    } 
  }, [accessToken, refreshToken, setAccessToken, setRefreshToken]);

  useEffect(() => {
    if (accessToken && refreshToken) {
      (async () => {
        try {
          // Immediately try to refresh
          await refreshAccessToken();
          // Then fetch user
          await fetchAndSetUser();
        } catch (error) {
          console.error('Error in immediate refresh/fetch:', error);
        } finally {
          setIsLoading(false);
        }
      })();
    } else {
      // If we have no tokens, not loading
      setIsLoading(false);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let refreshInterval: ReturnType<typeof setInterval> | null = null;

    if (refreshToken) {
      refreshInterval = setInterval(() => {
        refreshAccessToken().catch(err => console.error('Error in scheduled refresh:', err));
      }, TOKEN_EXPIRATION_TIME);
    }

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [refreshAccessToken, refreshToken]);

  /**
   * If still loading and no user loaded yet, you can show a spinner
   * or return null to block rendering the children.
   */
  if (isLoading) {
    return null; // or a <LoadingSpinner /> or a loading screen
  }

  return (
    <AuthContext.Provider
      value={{
        login,
        logout,
        isAuthenticated: !!user,
        user,
        isLoading,
        accessToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to consume AuthContext
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
