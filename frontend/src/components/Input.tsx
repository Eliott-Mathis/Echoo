import { type LucideIcon } from "lucide-react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  icon: LucideIcon;
}

export default function Input({ label, icon: Icon, ...props }: Props) {
  return (
    <div className="relative flex flex-col">
      <p className="absolute left-3 px-2 top-[-12px] bg-darkblue-500 text-input-primary-default-placeholder">
        {label}
      </p>
      <div className="flex items-center gap-1 border rounded-lg pl-5">
        <Icon className="text-input-primary-default-icon" />
        <input className="w-full h-full p-4 outline-none text-lg" {...props} />
      </div>
    </div>
  );
}
