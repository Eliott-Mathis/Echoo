import AuthLayout from "@/components/layout/Auth";
import NumberInput from "@/components/NumberInput";

import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EmailVerification() {
    let navigation = useNavigate()
    const [errorMessage] = useState("")
    const handleCodeCompletion = async(code: string) => {
        const email = localStorage.getItem("pendingEmail")

        if(!email) return;

        localStorage.setItem("pendingOtp", code)
        navigation("/complete-signup")
    }

    return <div>
        <AuthLayout title="Verify your email!" caption="For security reasons, we’ve sent a verification code to your email address.">
            <NumberInput qty={6} onComplete={async(n) => await handleCodeCompletion(n)}/>
            {errorMessage ? <p className="text-danger-low mt-2">{errorMessage}</p> : null}
        </AuthLayout>
    </div>
}