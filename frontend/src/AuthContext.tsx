import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { ReactNode } from 'react';
import {useNavigate  } from 'react-router-dom';

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
    const navigate = useNavigate();
    const login = async (email: string, password: string) => {
        try {
            const response = await axios.post(
                'http://127.0.0.1:8000/login',
                { email, password },
                {
                    headers: { 'Content-Type': 'application/json' },
                }
            );

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            setIsAuthenticated(true);
            setUser(response.data.user); // Assuming the user data is returned in the response
        } catch (error) {
            console.error('Login failed', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        setUser(null);
        navigate('/');
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