// Layout
import AuthLayout from "@/components/layout/Auth";

// Icons
import type { IconType } from "react-icons/lib";
import { GoogleIcon, Steam, Twitch, DiscordIcon, Apple } from "brand-logos";
import { Mail, Lock } from "lucide-react";

// Components
import Input from "@/components/Input";
import Button from "@/components/Button";

// Utils
import { useInput } from "@/hooks/useInput";
import { useSignIn } from "@/hooks/useAuth";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

interface OA2Props {
  icon: IconType;
  className?: string;
}

function OAuth2Button({ icon: Icon, className }: OA2Props) {
  return (
    <div className="bg-neutral-lowest w-full py-4 flex justify-center rounded-lg border border-neutral-low hover:bg-neutral-highest cursor-pointer">
      <Icon className={`${className}`} size={24} />
    </div>
  );
}

export default function Login() {
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync, isPending } = useSignIn(setErrorMessage);

  const navigate = useNavigate();

  const email = useInput("");
  const password = useInput("");

  const handleLogin = async () => {
    if (email.value.length === 0) {
      setErrorMessage("Please enter a valid email");
      return;
    }

    if (password.value.length === 0) {
      setErrorMessage("Please enter your password");
      return;
    }

    setErrorMessage("");
    
    try {
      await mutateAsync({ email: email.value, password: password.value });
      navigate("/");
    } catch {
      // Error handled by mutation
    }
  };

  return (
    <AuthLayout
      title="Welcome back!"
      caption="We're happy to see you again!"
    >
      <div className="flex flex-col gap-8 mt-2">
        <Input
          error={errorMessage}
          icon={Mail}
          label="Email"
          placeholder="example@echoo.now"
          {...email}
        />
        <Input
          icon={Lock}
          label="Password"
          type="password"
          placeholder="••••••••"
          {...password}
        />
      </div>
      <div className="flex flex-col w-full gap-2">
        <Button onClick={handleLogin} isLoading={isPending}>
          Log In
        </Button>
        <span className="flex gap-1">
          <p className="text-gray-300">Don't have an account?</p>
          <Link className="text-orange-400" to={"/signup"}>
            Sign Up
          </Link>
        </span>
      </div>
    </AuthLayout>
  );
}
