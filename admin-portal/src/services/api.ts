import axios from 'axios';

export const BASE_URL = 'http://localhost:5000';

const api = axios.create({
    baseURL: `${BASE_URL}/api`, // Shared backend
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            // Force reload to clear state and show login
            window.location.reload();
        }
        return Promise.reject(error);
    }
);

export default api;
