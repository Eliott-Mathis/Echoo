import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api/auth.api";

export const useCheckEmail = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.checkEmail,
        onError: (error: any) => {
            const message = error?.message ?? "Failed to check email";
            onError?.(message);
        },
    });
};

export const useSendVerificationOtp = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.sendVerificationOtp,
        onError: (error: any) => {
            const message = error?.message ?? "Une erreur est survenue";
            onError?.(message);
        },
    });
};

export const useCompleteSignUp = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.completeSignUp,
        onError: (error: any) => {
            const message = error?.message ?? "Une erreur est survenue";
            onError?.(message);
        },
    });
};

// Login hook
export const useSignIn = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.signIn,
        onError: (error: any) => {
            const message = error?.message ?? "Invalid email or password";
            onError?.(message);
        },
    });
};