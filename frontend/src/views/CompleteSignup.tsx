// Layout
import AuthLayout from "@/components/layout/Auth";

// Icons
import { AtSign, Calendar, KeyRound, User } from "lucide-react";

// Components
import Input from "@/components/Input";
import Button from "@/components/Button";

// Utils
import { useInput } from "@/hooks/useInput";
import { useCompleteSignUp } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CompleteSignup() {
  const [errorMessage, setErrorMessage] = useState("");
  const { mutateAsync, isPending } = useCompleteSignUp(setErrorMessage);
  const navigate = useNavigate();

  const password = useInput("");
  const username = useInput("");
  const displayName = useInput("");
  const birthDate = useInput("");

  const handleComplete = async () => {
    const email = localStorage.getItem("pendingEmail");
    const code = localStorage.getItem("pendingOtp");

    if (!email || !code) {
      setErrorMessage("Please verify your email first");
      return;
    }

    if (
      password.value.length < 8 ||
      username.value.length === 0 ||
      displayName.value.length === 0 ||
      birthDate.value.length === 0
    ) {
      setErrorMessage("Please fill all fields correctly");
      return;
    }

    setErrorMessage("");

    await mutateAsync({
      email,
      code,
      password: password.value,
      username: username.value,
      displayName: displayName.value,
      birthDate: birthDate.value,
    });

    localStorage.removeItem("pendingEmail");
    localStorage.removeItem("pendingOtp");
    navigate("/");
  };

  return (
    <AuthLayout
      title="Finish your profile"
      caption="Set your password and profile details to complete signup."
    >
      <div>
        <Input
          error={errorMessage}
          icon={KeyRound}
          label="Password"
          type="password"
          placeholder="At least 8 characters"
          {...password}
        />
      </div>
      <div>
        <Input
          error={errorMessage}
          icon={AtSign}
          label="Username"
          placeholder="your_username"
          {...username}
        />
      </div>
      <div>
        <Input
          error={errorMessage}
          icon={User}
          label="Display name"
          placeholder="Your name"
          {...displayName}
        />
      </div>
      <div>
        <Input
          error={errorMessage}
          icon={Calendar}
          label="Birth date"
          type="date"
          {...birthDate}
        />
      </div>
      <div className="flex flex-col w-full gap-2">
        <Button onClick={() => handleComplete()} isLoading={isPending}>
          Complete signup
        </Button>
      </div>
    </AuthLayout>
  );
}
