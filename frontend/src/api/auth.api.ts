import { apiClient } from "./client";
import { API_ROUTES } from "./endpoints";

interface DefaultApiResponse {
    ok: boolean;
}

interface ValidationMailResponse {
    ok: boolean;
    token: string
}

export const AuthAPI = {
    validation: async(payload: {email: string}): Promise<ValidationMailResponse> => {
        const { data } = await apiClient.post(API_ROUTES.auth.validation, payload)
        return data;
    },

    check: async(payload: {code: number, token: string}): Promise<DefaultApiResponse> => {
        const { data } = await apiClient.post(API_ROUTES.auth.check, payload)
        return data;
    },

    signUp: async (payload: {email: string}): Promise<DefaultApiResponse> => {
        const { data } = await apiClient.post(API_ROUTES.auth.signup, payload)
        return data;
    }
}