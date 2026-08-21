import * as React from "react";

import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "icon";

/**
 * Violet is the operator's pen: it marks the primary action and the current
 * selection, and it is not used for anything else on the board. Everything
 * else is enamel and rule.
 */
const VARIANTS: Record<Variant, string> = {
  solid: "bg-violet text-violet-ink shadow-lift-1 hover:bg-violet-hover active:bg-violet-hover",
  outline: "border border-rule bg-tile text-ink shadow-lift-1 hover:bg-wash active:bg-wash",
  ghost: "text-ink-soft hover:bg-wash hover:text-ink active:bg-wash",
  danger: "border border-rule bg-tile text-danger shadow-lift-1 hover:bg-danger-wash active:bg-danger-wash",
};

const SIZES: Record<Size, string> = {
  sm: "h-8 gap-1.5 px-2.5 text-13",
  md: "h-9 gap-2 px-3.5 text-13",
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
    "inline-flex cursor-pointer items-center rounded-md font-medium",
    // 150ms: the operator is in flow and should not wait for choreography.
    "transition-[background-color,border-color,color,box-shadow,translate] duration-150",
    // A control is a physical thing that goes down when pressed.
    "active:translate-y-px active:shadow-none",
    "disabled:pointer-events-none disabled:opacity-45 disabled:shadow-none",
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
