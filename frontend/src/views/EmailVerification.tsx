import AuthLayout from "@/components/layout/Auth";
import NumberInput from "@/components/NumberInput";

import { useSignUpCodeCheck } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function EmailVerification() {
    let navigation = useNavigate()
    const [errorMessage, setErrorMessage] = useState("")
    const {mutateAsync} = useSignUpCodeCheck(setErrorMessage)

    const handleCodeCompletion = async(code: number) => {
        const token = localStorage.getItem("authToken")

        if(!token) return;

        const data = await mutateAsync({code, token})

        if(data.ok) navigation("/")
    }

    return <div>
        <AuthLayout title="Verify your email!" caption="For security reasons, we’ve sent a verification code to your email address.">
            <NumberInput qty={6} onComplete={async(n) => await handleCodeCompletion(n)}/>
        </AuthLayout>
    </div>
}