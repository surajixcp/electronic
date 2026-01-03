import axios from 'axios';

// Create an Axios instance with base URL
const api = axios.create({
    baseURL: 'http://localhost:5000/api', // Adjust if backend runs on a different port
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token'); // Use a different key if needed, e.g., 'auth_token'
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`; // Adjust scheme if needed
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for error handling (optional but good practice)
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle 401 Unauthorized globally if needed (e.g., redirect to login)
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/#/auth?action=login';
        }
        return Promise.reject(error);
    }
);

export default api;
