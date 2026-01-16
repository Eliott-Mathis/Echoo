import type { ReactNode } from "react";
import LoaderDots from "./LoaderDots";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isLoading: boolean;
}

export default function Button({ children, isLoading, ...props }: Props) {
  if (!isLoading) {
    return (
      <button
        {...props}
        className="bg-orange-500 p-3 text-black text-lg font-semibold rounded-md border border-orange-300 hover:bg-orange-400 cursor-pointer"
      >
        {children}
      </button>
    );
  } else {
    return (
      <button
        {...props}
        className="bg-orange-500 p-3 text-black text-lg font-semibold rounded-md border border-orange-300 hover:bg-orange-400 cursor-pointer"
      >
        <LoaderDots />
      </button>
    );
  }
}
