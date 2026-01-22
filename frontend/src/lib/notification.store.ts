import {create} from 'zustand'

interface NotificationState {
    message: string | null;
    emit: (msg: string) => void;
    clear: () => void;
}

export const useNotification = create<NotificationState>((set) => ({
    message: null,
    emit: (msg) => set({message: msg}),
    clear: () => set({ message: null})
}))