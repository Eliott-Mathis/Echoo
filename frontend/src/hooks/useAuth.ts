import { useMutation } from "@tanstack/react-query";
import { AuthAPI } from "@/api/auth.api";
import type { AxiosError } from "axios";

export const useSignUpValidation = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.validation,
        onError: (error: AxiosError<any>) => {
            const message = error.response?.data.message ?? "Une erreur est survenue";
            onError?.(message);
        }
    })
}

export const useSignUpCodeCheck = (onError?: (message: string) => void) => {
    return useMutation({
        mutationFn: AuthAPI.check,
        onError: (error: AxiosError<any>) => {
            const message = error.response?.data.message ?? "Une erreur est survenue";
            onError?.(message);
        }
    })
}

export const useSignUp = () => {
    return useMutation({
        mutationFn: AuthAPI.signUp
    })
}