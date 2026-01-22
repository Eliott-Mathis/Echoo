import { Bell } from "lucide-react";
import { useNotification } from "@/lib/notification.store";

export default function Notification() {
    const { message } = useNotification();

    if(!message) return <div></div>;

    return (
        <div className="fixed bottom-0 right-0 p-4 m-4 bg-darkblue-500 border border-button-secondary-border rounded-2xl flex items-center gap-3">
      <Bell size={20} className="text-darkblue-800"/>
      <p>{message}</p>
    </div>
    )
}