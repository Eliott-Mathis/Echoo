import axios, { AxiosError } from "axios";

export const apiClient = axios.create({
    baseURL: 'http://localhost:3000',
    withCredentials: true,
    timeout: 10000
})

// interceptor
apiClient.interceptors.response.use((res) => res, (err: AxiosError) => {
    if(err.response?.status === 401){
        // logout
    }
    return Promise.reject(err);
})