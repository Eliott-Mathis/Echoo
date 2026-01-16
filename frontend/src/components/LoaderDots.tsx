export default function LoaderDots() {
  return (
    <div className="flex items-center justify-center gap-2 m-2.5">
      {[...Array(4)].map((_, i) => (
        <span
          key={i}
          className="h-2 w-2 rounded-full bg-orange-400 animate-[dot-pulse_1.5s_ease-in-out_infinite]"
          style={{
            animationDelay: `${-0.3 + i * 0.2}s`,
          }}
        />
      ))}
    </div>
  );
}
