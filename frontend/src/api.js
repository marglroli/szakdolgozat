import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const baseURL = import.meta.env.DEV ? 'http://localhost:8000' : `https://${location.hostname}`;

const instance = axios.create({
    baseURL,
    timeout: 600000,
});

instance.interceptors.request.use(async function (config) {
    if (config?.data instanceof FormData) Object.assign(config?.headers, { 'Content-Type': 'multipart/form-data' });

    const accessToken = localStorage.getItem('access_token');
    if (!accessToken) return config;

    const expired = jwtDecode(accessToken)?.exp < new Date() / 1000;

    if (!expired) {
        config.headers.Authorization = `Bearer ${accessToken}`;
        return config;
    }
    const refreshToken = localStorage.getItem('refresh_token');

    if (refreshToken) {
        try {
            const response = await axios.post(`${baseURL}/api/token/refresh/`, { refresh: refreshToken });
            localStorage.setItem('access_token', response?.data?.access);
            localStorage.setItem('refresh_token', response?.data?.refresh);
            config.headers.Authorization = `Bearer ${response?.data?.access}`;
            return config;
        } catch (error) {
            console.warn('AXIOS (There was no successful response for new tokens.)', error);
            if (error?.response?.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                location.assign(import.meta.env.DEV ? 'http://localhost:5173' : `https://${location.hostname}`);
            }
        }
    }
    console.log(4);
    return config;
});

export { instance as axios };
