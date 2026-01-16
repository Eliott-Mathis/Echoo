// Layout
import AuthLayout from "@/components/layout/Auth";

// Icons
import type { IconType } from "react-icons/lib";
import { GoogleIcon, Steam, Twitch, DiscordIcon, Apple } from "brand-logos";
import { Mail } from "lucide-react";

// Components
import Input from "@/components/Input";
import Button from "@/components/Button";

// Utils
import { useInput } from "@/utils/useInput";
import { useApi } from "@/hooks/useApi";
import { Link } from "react-router-dom";
import { useState } from "react";

interface OA2Props {
  icon: IconType;
  className?: string;
}

function OAuth2Button({ icon: Icon, className }: OA2Props) {
  return (
    <div className="bg-neutral-lowest w-full py-4 flex justify-center rounded-lg border border-neutral-low hover:bg-neutral-highest">
      <Icon className={`${className}`} size={24} />
    </div>
  );
}

export default function SignUp() {
  // form
  const email = useInput("");

  // api handling
  const { data, loading, error, setError, callApi } = useApi<{ message: string }>({
    url: "http://localhost:3000/auth/email-verification", method: 'POST', body:  { email: email.value}
  })

  const handleSignup = () => {
    if(email.value.length === 0){
      setError("Please enter a valid email")
      return;
    }
    callApi();
  };

  return (
    <AuthLayout
      title="Welcome!"
      caption="We're so excited for you to join our commnunity!"
    >
      <section className="flex justify-between gap-5">
        <OAuth2Button icon={GoogleIcon} />
        <OAuth2Button icon={Steam} />
        <OAuth2Button icon={Twitch} />
        <OAuth2Button icon={DiscordIcon} />
        <OAuth2Button icon={Apple} />
      </section>
      <div className="w-full flex justify-center">
        <hr className="w-[80%]" />
      </div>
      <div>
        <Input
          error={error ? error : ''}
          icon={Mail}
          label="Email"
          placeholder="example@echoo.now"
          {...email}
        />
      </div>
      <div className="flex flex-col w-full gap-2">
        <Button onClick={() => handleSignup()} isLoading={loading}>
          Sign Up
        </Button>
        <span className="flex gap-2">
          <p className="text-gray-300">Already have an account?</p>
          <Link className="text-orange-400" to={"/login"}>
            Log In
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}
