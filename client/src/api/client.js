import axios from 'axios'

export const TOKEN_KEY = "sweety_token";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})


// Automatically attach JWT token to every request

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Normalize server error messages

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.message || error.message || 'Something went wrong';
    const normalizedError = new Error(message);
    normalizedError.status = error.response?.status;
    return Promise.reject(normalizedError);
  }
);

export default api;