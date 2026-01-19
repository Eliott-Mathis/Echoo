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
import { useSignUpValidation } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
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
  const [errorMessage, setErrorMessage] = useState("")
  const { mutateAsync, isPending} = useSignUpValidation(setErrorMessage)

  // nav
  const navigate = useNavigate();  

  // form
  const email = useInput("");

  const handleSignup = async() => {
    if(email.value.length === 0){
      setErrorMessage("Please enter a valid email")
      return;
    }

    setErrorMessage("")
    const data = await mutateAsync({
      email: email.value
    })

    if(data.ok && data.token) {
      localStorage.setItem('authToken', data.token)
      navigate("/email-verification")
    } else {
      setErrorMessage("An error has occured")
    }

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
          error={errorMessage}
          icon={Mail}
          label="Email"
          placeholder="example@echoo.now"
          {...email}
        />
      </div>
      <div className="flex flex-col w-full gap-2">
        <Button onClick={() => handleSignup()} isLoading={isPending}>
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
