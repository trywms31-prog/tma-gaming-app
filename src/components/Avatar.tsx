import clsx from "clsx";

export function Avatar({
  name,
  src,
  size = 40,
}: {
  name: string;
  src?: string;
  size?: number;
}) {
  const initials = (name || "?").slice(0, 1).toUpperCase();
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-full bg-gradient-to-br from-neon-violet to-neon-cyan text-center font-semibold text-ink-950",
        "ring-1 ring-white/15",
      )}
      style={{ width: size, height: size, lineHeight: `${size}px`, fontSize: size * 0.42 }}
    >
      {src ? <img src={src} alt="" className="h-full w-full object-cover" /> : initials}
    </div>
  );
}
