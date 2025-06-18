import clsx from "clsx";

export default function Logo({ className = "" }: { className?: string }) {
  const classes = clsx(
    "text-green-500 font-bold text-xl",
    className
  )
  return (
    <div className={ classes }>
      <span role="img" aria-label="Vault Logo">🔐</span> Vault
    </div>
  );
}
