import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { ReactNode } from 'react';
import useLocalStorage from '../hooks/use-local-storage';

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
  const [accessToken, setAccessToken] = useLocalStorage('access_token', null);
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh_token', null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<AchieveUser | null>(null);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const {
          data: { access_token, refresh_token, user }
        } = await axios.post(
          'http://127.0.0.1:8000',
          { email, password },
          { headers: { 'Content-Type': 'application/json' } }
        );

        setAccessToken(access_token);
        setRefreshToken(refresh_token);

        setUser(user);
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 400) {
          console.error('Bad Request: ', error.response.data);
        } else {
          console.error('Login failed', error);
        }
      }
    },
    [setAccessToken, setRefreshToken]
  );

  const logout = useCallback(async () => {
    try {
      await axios.post(
        'http://127.0.0.1:8000/logout',
        { refresh_token: refreshToken },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );
      console.log('Logged out');
    } catch (error) {
      console.error('Logout failed', error);
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');

      setUser(null);
    }
  }, [accessToken, refreshToken]);

  useEffect(() => {
    const fetchAndAuthenticateUser = async () => {
      if (accessToken) {
        try {
          const { data } = await axios.get('http://127.0.0.1:8000/user', {
            headers: { Authorization: `Bearer ${accessToken}` }
          });

          setUser(data);
        } catch {
          await logout();
        }
      }

      setLoading(false);
    };

    fetchAndAuthenticateUser();
  }, [accessToken, logout]);

  if (loading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ login, logout, isAuthenticated: !!user, user }}>{children}</AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
