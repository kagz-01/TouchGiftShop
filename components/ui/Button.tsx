import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

export default function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  const base = "rounded-lg py-3 px-4 text-sm font-medium w-full";
  const styles =
    variant === "primary"
      ? "bg-brand text-white"
      : "border border-gray-300 text-gray-900";
  return <button className={`${base} ${styles} ${className}`} {...props} />;
}
