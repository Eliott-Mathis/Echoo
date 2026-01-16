import type { IconType } from "react-icons/lib";
import { GoogleIcon, Steam, Twitch, DiscordIcon, Apple } from "brand-logos";
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
  return (
    <AuthLayout
      title="Welcome!"
      caption="We're so excited for you to join our commnunity!"
    >
    </AuthLayout>
  );
}
