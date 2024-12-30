import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';

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
    logout: () => void;
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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<AchieveUser | null>(null);

    useEffect(() => {
        const fetchUser = () => {
            const accessToken = localStorage.getItem('access_token');
            console.log(accessToken)
            if (accessToken) {
                try {
                    const parts = accessToken.split('.');
                    if (parts.length !== 3) {
                        throw new Error('Invalid token');
                    }
                    const decodedToken: any = jwtDecode(accessToken);
                    if (!decodedToken || !decodedToken.id) {
                        throw new Error('Invalid token');
                    }
                    const userData: AchieveUser = {
                        id: decodedToken.id,
                        first_name: decodedToken.first_name,
                        last_name: decodedToken.last_name,
                        email: decodedToken.email,
                    };
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Failed to fetch user data', error);
                    setIsAuthenticated(false);
                    setUser(null);
                }
            }
        };

        fetchUser();
    }, []);

    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000',
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            localStorage.setItem('access_token', response.data.access_token);
            localStorage.setItem('refresh_token', response.data.refresh_token);
            setIsAuthenticated(true);
            console.log('access_token', response.data.access_token);
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 400) {
                console.error('Bad Request: ', error.response.data);
            } else {
                console.error('Login failed', error);
            }
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/logout');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
            setUser(null);

            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        } catch (error) {
            console.error('Logout failed', error);
        }
    };

    return (
        <AuthContext.Provider value={{ login, logout, isAuthenticated, user }}>
            {children}
        </AuthContext.Provider>
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