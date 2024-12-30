import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { ReactNode } from 'react';

// Define User type
interface AchieveUser {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password:string;
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
        const storedUser = localStorage.getItem('user');
        const storedIsAuthenticated = localStorage.getItem('isAuthenticated');

        if (storedUser && storedIsAuthenticated) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(JSON.parse(storedIsAuthenticated));
        }
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

            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            setIsAuthenticated(true);
            setUser(response.data.user); 
            if (response.data.user) {
                console.log('Logged in as', response.data.user.first_name);
            } else {
                console.error('User data is missing in the response');
            }
        } catch (error) {
            console.error("Login failed: User doesn't exis", error);
        }
    };

    const logout = async () => {
        try {
            await axios.post('http://127.0.0.1:8000/logout');
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setIsAuthenticated(false);
            setUser(null);
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