import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios, { AxiosError } from 'axios';
import { ReactNode } from 'react';
import useLocalStorage from '../hooks/use-local-storage';
import usePrevious from '../hooks/use-previous';

const TOKEN_EXPIRATION_TIME = 86_400_000;

// Define User type
interface AchieveUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_instructor: boolean;
}

// Define AuthContext type
interface AuthContextType {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUsers: () => Promise<void>;
  isAuthenticated: boolean;
  user: AchieveUser | null;
  users: AchieveUser[];
  isLoading: boolean; // For indicating blocking/loading state
  accessToken: string | null;
  registerSocketHandler: (event: string, handler: (data: unknown) => void) => void;
}

// Define AuthProviderProps
interface AuthProviderProps {
  children: ReactNode;
}

// Create AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//SOCKET HANDLER
type SocketHandlers = Record<string, (data: any) => void>;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [accessToken, setAccessToken] = useLocalStorage('access_token', localStorage.getItem('access_token'));
  const [refreshToken, setRefreshToken] = useLocalStorage('refresh_token', localStorage.getItem('refresh_token'));
  const [user, setUser] = useState<AchieveUser | null>(null);
  const [users, setUsers] = useState<AchieveUser[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [socket, setSocket] = useState<WebSocket | null>(null);

  const [socketHandlers, setSocketHandlers] = useState<SocketHandlers>({});

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

  const fetchUsers = useCallback(async () => {
    if (!accessToken) return;
    try {
      const response = await axios.get('http://127.0.0.1:8000/users', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      setUsers(response.data.users || []);
    } catch {
      console.error('Failed to fetch users');
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

  const connectSocket = useCallback(async () => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws/');
    setSocket(ws);

    ws.onopen = () => {
      console.log('Connected to WebSocket');
    };

    ws.onerror = error => {
      console.error('WebSocket error:', error);
    };
  }, []);

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


  }, []);

  const previousUser = usePrevious(user);

  useEffect(() => {
    if (user?.id !== previousUser?.id) {
      connectSocket();
    }
  }, [user]);

  useEffect(() => {
    if (socket) {
      socket.onmessage = event => {
        const data = JSON.parse(event.data);
        const handler = socketHandlers[data.type];
        if (handler) {
          handler(data.message);
        }
      };
    }
  }, [socket, socketHandlers]);

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
        users,
        fetchUsers,
        login,
        logout,
        isAuthenticated: !!user,
        user,
        isLoading,
        accessToken,
        registerSocketHandler: (event, handler) => {
          setSocketHandlers(prevHandlers => ({
            ...prevHandlers,
            [event]: handler
          }));
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
