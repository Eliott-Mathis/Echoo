import { Bell } from "lucide-react"
import { useState } from "react"

export const Notification = ({message}: {message: string}) => {    
    const [visible, setVisible] = useState(true)

    if(visible){
        return <div className="absolute bottom-0 right-0 p-4 m-4 bg-darkblue-500 border border-button-secondary-border rounded-2xl flex items-center gap-3">
        <Bell size={20} className="text-darkblue-800"/>
        <p>{message}</p>
    </div>
    }
    
}
