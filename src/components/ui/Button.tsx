import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

const VARIANTS: Record<Variant, string> = {
  solid: "bg-violet text-violet-ink hover:bg-violet-hover shadow-file",
  outline: "border border-rule bg-file text-ink hover:bg-wash",
  ghost: "text-ink-soft hover:bg-wash hover:text-ink",
  danger: "border border-rule bg-file text-danger hover:bg-danger-wash",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-3 text-13",
  md: "h-9.5 gap-2 px-4 text-sm",
  icon: "size-8 justify-center",
};

/**
 * The button's classes, without the element.
 *
 * A button-shaped link is a link, and swapping the element under it (Radix's
 * `asChild`) would cost a dependency this app otherwise does not need. Callers
 * that want a link spread these onto `<Link>` directly.
 */
export function buttonClasses({
  variant = "outline",
  size = "md",
  className,
}: { variant?: Variant; size?: Size; className?: string } = {}) {
  return cn(
    "inline-flex cursor-pointer items-center rounded-md font-medium transition-colors",
    "disabled:pointer-events-none disabled:opacity-50",
    VARIANTS[variant],
    SIZES[size],
    className,
  );
}

export function Button({
  variant,
  size,
  className,
  ...props
}: React.ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClasses({ variant, size, className })} {...props} />;
}
