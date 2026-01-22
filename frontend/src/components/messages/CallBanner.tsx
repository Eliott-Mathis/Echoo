import { useCallStore } from "@/stores/callStore"
import { PhoneMissed } from "lucide-react"

export default function CallBanner({username}: {username: string}){
    const {isCalling, users, endCall} = useCallStore()

    if(isCalling && users.find(usr => usr.username === username))
    return <div className="bg-darkblue-500 rounded-lg p-16 flex flex-col items-center gap-8">
        <section className="flex w-full justify-center gap-12">
        {users && users.map(user => (
            <div className="flex flex-col w-fit items-center gap-2">
                <div className="bg-darkblue-600 w-[70px] h-[70px] rounded-full"></div>
                <p>{user.username}</p>
            </div>
        ))}
        </section>
        <div>
            <button onClick={() => endCall()} className="bg-danger-low p-4 rounded-full">
                <PhoneMissed/>
            </button>
        </div>
    </div>
}