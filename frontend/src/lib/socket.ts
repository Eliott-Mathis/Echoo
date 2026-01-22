import { io, Socket } from "socket.io-client"
import { NotificationAPI } from "./notification"

export interface SocketNotification {
  type: "success" | "error"
  message: string
}

const socket: Socket = io("http://localhost:3000", {
  withCredentials: true,
})

socket.on('notification', (data: SocketNotification) => {
  NotificationAPI.emit(data.message)

  setTimeout(() => {
    NotificationAPI.clear()
  }, 3000)
})


export default socket;
