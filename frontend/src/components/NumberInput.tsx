import { useRef, useState } from "react"

export default function NumberInput({ qty, onComplete }: { qty: number, onComplete: (n: number) => void }) {
    const inputsRef = useRef<HTMLInputElement[]>([])
    const [values, setValues] = useState<string[]>(Array(qty).fill(""));

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
        let value = e.target.value;

        // limit to one digit
        if(value.length > 1){
            e.target.value = value.slice(0, 1);
        }

        const newValues = [...values]
        newValues[idx] = value
        setValues(newValues)

        // focus next input
        if(value && idx < qty - 1) {
            inputsRef.current[idx + 1]?.focus()
        } 

        if (idx === qty - 1 && value) {
            const finalValue = parseInt(newValues.join(""));
            onComplete(finalValue);
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, idx: number) => {
        if (e.key === "Backspace" && !e.currentTarget.value && idx > 0) {
            inputsRef.current[idx - 1]?.focus();
        }
    };


    return (
        <div className="w-full flex gap-4">
            {Array.from({ length: qty }).map((_, idx) => (
                <input ref={(el) => {
            inputsRef.current[idx] = el!;
          }} onChange={(e) => handleChange(e, idx)} onKeyDown={(e) => handleKeyDown(e, idx)}
 key={idx} type="number" className="flex text-3xl w-full h-[86px] outline-none no-spinner bg-button-secondary-default-background text-center border border-button-secondary-default-border rounded-lg"/>
            ))}
            
        </div>
    )
}