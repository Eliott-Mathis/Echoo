import { useNotification } from "./notification.store";

export const NotificationAPI = {
    emit(message: string){
        useNotification.getState().emit(message)
    },
    clear() {
        useNotification.getState().clear()
    }
}