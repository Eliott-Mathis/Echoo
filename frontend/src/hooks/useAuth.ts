import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api/auth.api";

export const useSendVerificationOtp = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.sendVerificationOtp,
        onError: (error: any) => {
            const message = error?.message ?? "Une erreur est survenue";
            onError?.(message);
        },
    });
};

export const useCheckVerificationOtp = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.checkVerificationOtp,
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