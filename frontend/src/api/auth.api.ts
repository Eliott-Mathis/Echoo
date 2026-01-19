import { authClient } from "@/lib/authClient";
import { apiClient } from "./client";

type DefaultApiResponse = unknown;

export const AuthAPI = {
    sendVerificationOtp: async (payload: { email: string }) => {
        const { data, error } = await authClient.emailOtp.sendVerificationOtp({
            email: payload.email,
            type: "sign-in",
        });

        if (error) throw error;
        return data;
    },

    checkVerificationOtp: async (payload: { email: string; code: string }) => {
        const { data } = await apiClient.post("/auth/check-otp", {
            email: payload.email,
            code: payload.code,
        });
        return data;
    },

    completeSignUp: async (payload: {
        email: string;
        code: string;
        password: string;
        username: string;
        displayName: string;
        birthDate: string;
    }): Promise<DefaultApiResponse> => {
        const { data } = await apiClient.post("/auth/complete-signup", payload);
        return data;
    },
};