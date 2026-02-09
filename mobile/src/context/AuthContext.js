import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, saveToken, getToken, removeToken } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        checkAuthStatus();
    }, []);

    const checkAuthStatus = async () => {
        try {
            const token = await getToken();
            if (token) {
                const profile = await authApi.getProfile();
                setUser(profile);
            }
        } catch (err) {
            await removeToken();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email, password) => {
        setError(null);
        try {
            const response = await authApi.login(email, password);
            await saveToken(response.accessToken);
            setUser(response.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const signup = async (email, password, displayName) => {
        setError(null);
        try {
            const response = await authApi.signup(email, password, displayName);
            await saveToken(response.accessToken);
            setUser(response.user);
            return true;
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
            return false;
        }
    };

    const logout = async () => {
        await removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                error,
                login,
                signup,
                logout,
                isAuthenticated: !!user,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
