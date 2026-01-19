import { authClient } from "@/lib/authClient";
import { apiClient } from "./client";

type DefaultApiResponse = unknown;

export const AuthAPI = {
    // Sign up - send OTP for email verification
    sendVerificationOtp: async (payload: { email: string }) => {
        const { data, error } = await authClient.emailOtp.sendVerificationOtp({
            email: payload.email,
            type: "sign-in",
        });

        if (error) throw error;
        return data;
    },

    // Login with email and password
    signIn: async (payload: { email: string; password: string }) => {
        const { data, error } = await authClient.signIn.email({
            email: payload.email,
            password: payload.password,
        });

        if (error) throw error;
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