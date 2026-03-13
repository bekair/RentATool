import axios from 'axios';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_URL = Constants.expoConfig.extra.apiUrl;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export const authApi = {
    signup: async (email, password, firstName, lastName) => {
        const response = await api.post('/auth/signup', {
            email,
            password,
            firstName,
            lastName
        });
        return response.data;
    },

    login: async (email, password) => {
        const response = await api.post('/auth/login', {
            email,
            password,
        });
        return response.data;
    },

    getProfile: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    forgotPassword: async (email) => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },
};

export const toolsApi = {
    getAvailability: async (id) => {
        const response = await api.get(`/tools/${id}/availability`);
        return response.data;
    },
    updateAvailability: async (id, manualBlockedDates) => {
        const response = await api.patch(`/tools/${id}/availability`, { manualBlockedDates });
        return response.data;
    },
};

export const paymentsApi = {
    getSummary: async () => {
        const response = await api.get('/payments/me/summary');
        return response.data;
    },

    createSetupIntent: async () => {
        const response = await api.post('/payments/me/setup-intent');
        return response.data;
    },

    createConnectAccountLink: async () => {
        const response = await api.post('/payments/me/connect-account-link');
        return response.data;
    },

    createPayoutDashboardLink: async () => {
        const response = await api.post('/payments/me/payout-dashboard-link');
        return response.data;
    },

    refreshStatus: async () => {
        const response = await api.post('/payments/me/refresh-status');
        return response.data;
    },
};

export const saveToken = async (token) => {
    await SecureStore.setItemAsync('authToken', token);
};

export const getToken = async () => {
    return await SecureStore.getItemAsync('authToken');
};

export const removeToken = async () => {
    await SecureStore.deleteItemAsync('authToken');
};

export default api;

