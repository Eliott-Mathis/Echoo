import { createAuthClient } from "better-auth/react"
import {stripeClient} from "@better-auth/stripe/client"
import Button from "@/components/Button"
import { useState } from "react"

const authClient = createAuthClient({
    baseURL: "http://localhost:3000",
    plugins: [
        stripeClient({
            subscription: true
        })
    ]
})

export default function DynamiteTab() {
  const [loading, setLoading] = useState(false)

    const handlePayement = async() => {
        const {data, error} = await authClient.subscription.upgrade({
            plan: 'Dynamite',
            annual: false,
            successUrl: 'http://localhost:5173/dynamite/success',
            cancelUrl: 'http://localhost:5173/dynamite/cancel',
            disableRedirect: false
        })
    }

  return (
    <div className="flex-1 px-10 py-8">
      <div className="max-w-3xl flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Dynamite</h1>
        <Button isLoading={loading} onClick={handlePayement}>Acheter</Button>
      </div>
    </div>
  );
}
