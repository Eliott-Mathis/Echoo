import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  title: string;
  caption: string;
}

export default function AuthLayout({ children, title, caption }: Props) {
  return (
    <div className="bg-background bg-[url(/mainBackground.png)] bg-cover  relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg border gap-8">
      <header className="z-50 flex flex-col items-center gap-3">
        <h2 className="text-3xl font-bold">{title}</h2>
        <p className="text-black-800">{caption}</p>
      </header>
      <main className="z-50 bg-darkblue-500 p-6 rounded-2xl w-[550px] flex flex-col gap-6">
        {children}
      </main>
    </div>
  );
}
