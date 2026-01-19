// Icons
import { Plus } from "lucide-react"

export default function ServerList(){
    return <div className="p-4 flex flex-col w-fit gap-4 items-center">
        <img src="/DarkLogo.png" alt="Logo"/>
        <hr className="w-[80%]"/>
        <button className="w-full aspect-square flex justify-center items-center border w-full rounded-full hover:bg-blue-950 transition-colors duration-300"><Plus/></button>
    </div>
}